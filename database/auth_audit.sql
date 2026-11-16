 CREATE TABLE IF NOT EXISTS roles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS permissions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(80) NOT NULL UNIQUE,
        description VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS role_permissions (
        role_id BIGINT NOT NULL,
        permission_id BIGINT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id),
        CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NULL,
        role_id BIGINT NOT NULL,
        status ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        actor_user_id BIGINT NULL,
        actor_username VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        summary VARCHAR(255) NOT NULL,
        reason VARCHAR(500) NULL,
        details_json JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
        INDEX idx_audit_logs_created_at (created_at),
        INDEX idx_audit_logs_entity (entity_type, entity_id),
        INDEX idx_audit_logs_actor (actor_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =========================================================
    -- Dữ liệu mẫu (Seed data) phục vụ kiểm thử kết nối & phân quyền
    -- =========================================================

    INSERT INTO roles (code, name, description) VALUES
        ('ADMIN', 'Quản trị hệ thống', 'Cấp tài khoản nội bộ, phân quyền và xem nhật ký'),
        ('RESIDENT_MANAGER', 'Quản lý cư dân', 'Quản lý hộ gia đình, cư dân và biến động cư
        trú'),
        ('FEE_COLLECTOR', 'Người thu phí', 'Thiết lập khoản thu, tính phí, thu tiền, in chứng
        từ và hủy giao dịch')
    ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

    INSERT INTO permissions (code, description) VALUES
        ('USER_MANAGE', 'Cấp tài khoản và phân quyền nội bộ'),
        ('HOUSEHOLD_READ', 'Xem và tra cứu hộ gia đình, cư dân'),
        ('HOUSEHOLD_WRITE', 'Thêm và cập nhật hộ gia đình, cư dân'),
        ('RESIDENT_CHANGE_WRITE', 'Ghi nhận chuyển đến, chuyển đi, tạm trú, tạm vắng'),
        ('FEE_CONFIG', 'Thiết lập khoản thu, kỳ thu và tính phí phải thu'),
        ('PAYMENT_RECORD', 'Ghi nhận thu phí bắt buộc, đóng góp tự nguyện và in chứng từ'),
        ('PAYMENT_CANCEL', 'Hủy giao dịch thu tiền sai kèm lý do'),
        ('REPORT_VIEW', 'Xem thống kê tình hình thu phí'),
        ('AUDIT_LOG_VIEW', 'Xem nhật ký thao tác hệ thống')
    ON DUPLICATE KEY UPDATE description = VALUES(description);

    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p
    WHERE r.code = 'ADMIN';

    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p
    WHERE r.code = 'RESIDENT_MANAGER'
      AND p.code IN ('HOUSEHOLD_READ', 'HOUSEHOLD_WRITE', 'RESIDENT_CHANGE_WRITE');

    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p
    WHERE r.code = 'FEE_COLLECTOR'
      AND p.code IN ('HOUSEHOLD_READ', 'FEE_CONFIG', 'PAYMENT_RECORD', 'PAYMENT_CANCEL',
      'REPORT_VIEW');

    -- Tài khoản mẫu (password_hash là chuỗi BCrypt mẫu dùng để test cấu trúc bảng)
    INSERT INTO users (username, password_hash, full_name, phone, role_id, status)
    SELECT 'admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5E0P5z2Q3u7X0Z8K6m0y1w9u2v3W2', 'Quản trị
    viên BlueMoon', '0900000001', r.id, 'ACTIVE'
    FROM roles r WHERE r.code = 'ADMIN'
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

    INSERT INTO users (username, password_hash, full_name, phone, role_id, status)
    SELECT 'qlcudan01', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5E0P5z2Q3u7X0Z8K6m0y1w9u2v3W2', 'Cán bộ
    Quản lý Cư dân', '0900000002', r.id, 'ACTIVE'
    FROM roles r WHERE r.code = 'RESIDENT_MANAGER'
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

    INSERT INTO users (username, password_hash, full_name, phone, role_id, status)
    SELECT 'thuphi01', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5E0P5z2Q3u7X0Z8K6m0y1w9u2v3W2', 'Cán bộ
    Thu phí', '0900000003', r.id, 'ACTIVE'
    FROM roles r WHERE r.code = 'FEE_COLLECTOR'
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

    INSERT INTO audit_logs (actor_user_id, actor_username, action, entity_type, entity_id,
    summary, reason, details_json)
    SELECT u.id, u.username, 'SEED_INIT', 'SYSTEM', 'INIT-01',
           'Khởi tạo dữ liệu mẫu tài khoản và phân quyền', NULL,
           JSON_OBJECT('rolesCount', 3, 'usersCount', 3)
    FROM users u
    WHERE u.username = 'admin'
      AND NOT EXISTS (SELECT 1 FROM audit_logs WHERE action = 'SEED_INIT' AND entity_id =
      'INIT-01');
