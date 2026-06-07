-- ============================================================
-- ADVANCED SQL QUERIES (VIEWS) FOR PROJECT EVALUATION
-- ============================================================

-- 1. Comprehensive Sales Summary View (Uses Joins and Aggregations)
-- This view joins orders, order_items, and profiles to give a high-level summary of sales
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT 
    EXTRACT(MONTH FROM o.created_at) AS order_month,
    EXTRACT(YEAR FROM o.created_at) AS order_year,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(o.subtotal) AS total_revenue,
    SUM(oi.quantity) AS total_items_sold
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at)
ORDER BY order_year DESC, order_month DESC;


-- 2. Customer Order History View (Uses Subqueries and Joins)
-- Shows each customer's lifetime value, total orders, and last order date
CREATE OR REPLACE VIEW customer_stats_view AS
SELECT 
    p.id AS customer_id,
    p.full_name AS customer_name,
    p.phone AS customer_phone,
    (SELECT COUNT(*) FROM orders WHERE orders.user_id = p.id) AS total_orders_placed,
    COALESCE(SUM(o.total), 0) AS lifetime_value,
    MAX(o.created_at) AS last_order_date
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
WHERE p.role = 'customer'
GROUP BY p.id, p.full_name, p.phone
ORDER BY lifetime_value DESC;


-- 3. Product Performance View
-- Shows which products are selling the most, joining categories and products
CREATE OR REPLACE VIEW product_performance_view AS
SELECT 
    pr.id AS product_id,
    pr.name AS product_name,
    c.name AS category_name,
    pr.stock_qty AS current_stock,
    COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue_generated
FROM products pr
LEFT JOIN categories c ON pr.category_id = c.id
LEFT JOIN order_items oi ON pr.id = oi.product_id
GROUP BY pr.id, pr.name, c.name, pr.stock_qty
ORDER BY total_units_sold DESC;

-- Grant permissions for the views
GRANT SELECT ON monthly_sales_report TO authenticated, anon;
GRANT SELECT ON customer_stats_view TO authenticated, anon;
GRANT SELECT ON product_performance_view TO authenticated, anon;
