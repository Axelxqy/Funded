const pool = require("../helper/db.js");

class Donation {
  // keep your existing create/get methods here

  static async getDailyReport() {
    const summaryResult = await pool.query(
      `
      SELECT
        COALESCE((
          SELECT COUNT(*)
          FROM public.user_account
          WHERE DATE(created_at) = CURRENT_DATE
        ), 0) AS new_users,

        COALESCE((
          SELECT COUNT(*)
          FROM public.fr_activity
          WHERE DATE(created_at) = CURRENT_DATE
        ), 0) AS new_campaigns,

        COALESCE((
          SELECT SUM(amount)
          FROM public.donation
          WHERE DATE(COALESCE(created_at, date)) = CURRENT_DATE
        ), 0) AS total_donations,

        COALESCE((
          SELECT COUNT(*)
          FROM public.activity_view_log
          WHERE DATE(viewed_at) = CURRENT_DATE
        ), 0) AS total_views;
      `
    );

    const logsResult = await pool.query(
      `
      SELECT *
      FROM (
        SELECT
          ua.created_at AS log_time,
          CONCAT(ua.f_name, ' ', ua.l_name) AS user_name,
          'Registered new account' AS action,
          'Active' AS status
        FROM public.user_account ua
        WHERE DATE(ua.created_at) = CURRENT_DATE

        UNION ALL

        SELECT
          fa.created_at AS log_time,
          CONCAT(ua.f_name, ' ', ua.l_name) AS user_name,
          'Created campaign "' || fa.activity_name || '"' AS action,
          fa.status AS status
        FROM public.fr_activity fa
        LEFT JOIN public.user_account ua
          ON fa.created_by = ua.user_id
        WHERE DATE(fa.created_at) = CURRENT_DATE

        UNION ALL

        SELECT
          COALESCE(d.created_at, d.date) AS log_time,
          CONCAT(ua.f_name, ' ', ua.l_name) AS user_name,
          'Made donation SGD ' || d.amount AS action,
          'Success' AS status
        FROM public.donation d
        LEFT JOIN public.user_account ua
          ON d.user_id = ua.user_id
        WHERE DATE(COALESCE(d.created_at, d.date)) = CURRENT_DATE

        UNION ALL

        SELECT
          avl.viewed_at AS log_time,
          'Visitor' AS user_name,
          'Viewed campaign "' || fa.activity_name || '"' AS action,
          'Viewed' AS status
        FROM public.activity_view_log avl
        LEFT JOIN public.fr_activity fa
          ON avl.activity_id = fa.activity_id
        WHERE DATE(avl.viewed_at) = CURRENT_DATE
      ) report_logs
      ORDER BY log_time DESC
      LIMIT 50;
      `
    );

    return {
      summary: summaryResult.rows[0],
      logs: logsResult.rows,
    };
  }

  static async getWeeklyReport() {
    const summaryResult = await pool.query(
      `
      SELECT
        COALESCE((
          SELECT COUNT(*)
          FROM public.user_account
          WHERE created_at >= date_trunc('week', CURRENT_DATE)
            AND created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        ), 0) AS new_users,

        COALESCE((
          SELECT COUNT(*)
          FROM public.fr_activity
          WHERE created_at >= date_trunc('week', CURRENT_DATE)
            AND created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        ), 0) AS new_campaigns,

        COALESCE((
          SELECT SUM(amount)
          FROM public.donation
          WHERE COALESCE(created_at, date) >= date_trunc('week', CURRENT_DATE)
            AND COALESCE(created_at, date) < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        ), 0) AS total_donations,

        COALESCE((
          SELECT COUNT(*)
          FROM public.activity_view_log
          WHERE viewed_at >= date_trunc('week', CURRENT_DATE)
            AND viewed_at < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
        ), 0) AS total_views;
      `
    );

    const rowsResult = await pool.query(
      `
      WITH days AS (
        SELECT generate_series(
          date_trunc('week', CURRENT_DATE)::date,
          (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date,
          INTERVAL '1 day'
        )::date AS report_date
      )
      SELECT
        TO_CHAR(days.report_date, 'Day') AS label,
        days.report_date,

        COALESCE((
          SELECT COUNT(*)
          FROM public.user_account ua
          WHERE DATE(ua.created_at) = days.report_date
        ), 0) AS new_users,

        COALESCE((
          SELECT COUNT(*)
          FROM public.fr_activity fa
          WHERE DATE(fa.created_at) = days.report_date
        ), 0) AS new_campaigns,

        COALESCE((
          SELECT SUM(d.amount)
          FROM public.donation d
          WHERE DATE(COALESCE(d.created_at, d.date)) = days.report_date
        ), 0) AS total_donations,

        COALESCE((
          SELECT COUNT(*)
          FROM public.activity_view_log avl
          WHERE DATE(avl.viewed_at) = days.report_date
        ), 0) AS total_views

      FROM days
      ORDER BY days.report_date;
      `
    );

    return {
      summary: summaryResult.rows[0],
      rows: rowsResult.rows,
    };
  }

  static async getMonthlyReport() {
    const summaryResult = await pool.query(
      `
      SELECT
        COALESCE((
          SELECT COUNT(*)
          FROM public.user_account
          WHERE created_at >= date_trunc('month', CURRENT_DATE)
            AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        ), 0) AS new_users,

        COALESCE((
          SELECT COUNT(*)
          FROM public.fr_activity
          WHERE created_at >= date_trunc('month', CURRENT_DATE)
            AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        ), 0) AS new_campaigns,

        COALESCE((
          SELECT SUM(amount)
          FROM public.donation
          WHERE COALESCE(created_at, date) >= date_trunc('month', CURRENT_DATE)
            AND COALESCE(created_at, date) < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        ), 0) AS total_donations,

        COALESCE((
          SELECT COUNT(*)
          FROM public.activity_view_log
          WHERE viewed_at >= date_trunc('month', CURRENT_DATE)
            AND viewed_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        ), 0) AS total_views;
      `
    );

    const rowsResult = await pool.query(
      `
      WITH weeks AS (
        SELECT
          1 AS week_no,
          date_trunc('month', CURRENT_DATE)::date AS start_date,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '6 days')::date AS end_date

        UNION ALL

        SELECT
          2,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '7 days')::date,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '13 days')::date

        UNION ALL

        SELECT
          3,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '20 days')::date

        UNION ALL

        SELECT
          4,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '21 days')::date,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date
      )
      SELECT
        'Week ' || weeks.week_no AS label,
        weeks.start_date,
        weeks.end_date,

        COALESCE((
          SELECT COUNT(*)
          FROM public.user_account ua
          WHERE DATE(ua.created_at) BETWEEN weeks.start_date AND weeks.end_date
        ), 0) AS new_users,

        COALESCE((
          SELECT COUNT(*)
          FROM public.fr_activity fa
          WHERE DATE(fa.created_at) BETWEEN weeks.start_date AND weeks.end_date
        ), 0) AS new_campaigns,

        COALESCE((
          SELECT SUM(d.amount)
          FROM public.donation d
          WHERE DATE(COALESCE(d.created_at, d.date)) BETWEEN weeks.start_date AND weeks.end_date
        ), 0) AS total_donations,

        COALESCE((
          SELECT COUNT(*)
          FROM public.activity_view_log avl
          WHERE DATE(avl.viewed_at) BETWEEN weeks.start_date AND weeks.end_date
        ), 0) AS total_views

      FROM weeks
      ORDER BY weeks.week_no;
      `
    );

    return {
      summary: summaryResult.rows[0],
      rows: rowsResult.rows,
    };
  }
}

module.exports = Donation;