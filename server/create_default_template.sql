INSERT INTO templates (id, name, category, thumbnail_url, html_template, css_styles, is_premium, is_active, sort_order, created_at, updated_at)
VALUES ('default', 'Default Template', 'PROFESSIONAL', '', '<div class="resume"></div>', '.resume { padding: 20px; }', false, true, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE name='Default Template';
