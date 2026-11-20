-- =====================================================================
-- BlueMoon — Thiết kế bảng và dữ liệu mẫu Biến động cư trú (US-06, US-07)
-- Người thực hiện: Nguyễn Trần Tuấn Kiệt (MSSV: 202416257)
-- Mục đích: Gửi Đỗ Duy Hưng tổng hợp vào script CSDL chung cùng bảng
--           households, residents và auth_audit.sql (MySQL 8.0, utf8mb4).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bảng chuyển đến / chuyển đi (US-06)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residence_changes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT NOT NULL COMMENT 'Tham chiếu residents(id)',
    household_id BIGINT NOT NULL COMMENT 'Hộ gia đình tại thời điểm phát sinh biến động — tham chiếu households(id)',
    change_type ENUM('MOVE_IN', 'MOVE_OUT') NOT NULL COMMENT 'MOVE_IN: Chuyển đến, MOVE_OUT: Chuyển đi',
    effective_date DATE NOT NULL COMMENT 'Ngày hiệu lực nghiệp vụ',
    previous_address VARCHAR(255) NULL COMMENT 'Địa chỉ trước khi chuyển đến',
    destination_address VARCHAR(255) NULL COMMENT 'Địa chỉ chuyển đến khi chuyển đi',
    note VARCHAR(500) NULL COMMENT 'Ghi chú bổ sung',
    created_by BIGINT NOT NULL COMMENT 'Người ghi nhận — tham chiếu users(id)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_rc_resident_date (resident_id, effective_date DESC),
    INDEX idx_rc_household_date (household_id, effective_date DESC),
    INDEX idx_rc_type_date (change_type, effective_date DESC)

    -- [CHỜ GHÉP ERD CHUNG] Kích hoạt các khóa ngoại bên dưới sau khi Đỗ Duy Hưng
    -- hoàn thiện bảng households, residents và ghép cùng database/auth_audit.sql:
    -- , CONSTRAINT fk_rc_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
    -- , CONSTRAINT fk_rc_household FOREIGN KEY (household_id) REFERENCES households(id)
    -- , CONSTRAINT fk_rc_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Bảng đăng ký tạm trú / tạm vắng (US-07)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS temporary_residences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT NOT NULL COMMENT 'Tham chiếu residents(id)',
    household_id BIGINT NOT NULL COMMENT 'Hộ gia đình tại thời điểm đăng ký — tham chiếu households(id)',
    record_type ENUM('TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE') NOT NULL COMMENT 'TEMPORARY_RESIDENCE: Tạm trú, TEMPORARY_ABSENCE: Tạm vắng',
    start_date DATE NOT NULL COMMENT 'Ngày bắt đầu hiệu lực',
    end_date DATE NULL COMMENT 'Ngày kết thúc (NULL nếu chưa xác định)',
    location_address VARCHAR(255) NULL COMMENT 'Địa chỉ tạm trú/tạm vắng liên quan',
    reason VARCHAR(500) NULL COMMENT 'Lý do đăng ký',
    status ENUM('ACTIVE', 'ENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL COMMENT 'Người ghi nhận — tham chiếu users(id)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_tr_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    INDEX idx_tr_resident_dates (resident_id, start_date DESC, end_date),
    INDEX idx_tr_household_dates (household_id, start_date DESC, end_date),
    INDEX idx_tr_type_dates (record_type, start_date, end_date)

    -- [CHỜ GHÉP ERD CHUNG] Kích hoạt các khóa ngoại bên dưới khi ghép script chung:
    -- , CONSTRAINT fk_tr_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
    -- , CONSTRAINT fk_tr_household FOREIGN KEY (household_id) REFERENCES households(id)
    -- , CONSTRAINT fk_tr_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. View hợp nhất lịch sử biến động cư trú phục vụ tra cứu (US-15)
--    Khớp cấu trúc DTO trong docs/design/api-search.md (mục 7.7 - 7.8)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_residence_history AS
SELECT
    rc.id AS event_id,
    CAST(rc.change_type AS CHAR(30)) AS event_type,
    rc.resident_id,
    rc.household_id,
    rc.effective_date AS effective_date,
    CAST(NULL AS DATE) AS end_date,
    rc.note AS description,
    rc.created_by,
    rc.created_at
FROM residence_changes rc
UNION ALL
SELECT
    tr.id AS event_id,
    CAST(tr.record_type AS CHAR(30)) AS event_type,
    tr.resident_id,
    tr.household_id,
    tr.start_date AS effective_date,
    tr.end_date AS end_date,
    tr.reason AS description,
    tr.created_by,
    tr.created_at
FROM temporary_residences tr
WHERE tr.status <> 'CANCELLED';

-- =====================================================================
-- 4. Dữ liệu mẫu (Seed data) phục vụ kiểm thử US-06, US-07, US-15
--    Giả định ID mẫu tạm thời (sẽ cập nhật khớp seed của Đỗ Duy Hưng):
--      - household_id = 101 (HO-001 - Căn hộ A1201)
--      - resident_id  = 501 (CD-001 - Nguyễn Văn An)
--      - resident_id  = 502 (CD-002 - Trần Thị Bình)
--      - created_by   = 2   (qlcudan01 trong auth_audit.sql)
-- =====================================================================

INSERT INTO residence_changes
    (resident_id, household_id, change_type, effective_date, previous_address, destination_address, note, created_by)
VALUES
    (501, 101, 'MOVE_IN', '2026-11-10', '123 Phố Huế, Hai Bà Trưng, Hà Nội', NULL, 'Chủ hộ chuyển đến nhận căn hộ A1201', 2),
    (502, 101, 'MOVE_IN', '2026-11-10', '123 Phố Huế, Hai Bà Trưng, Hà Nội', NULL, 'Thành viên chuyển đến cùng chủ hộ', 2),
    (502, 101, 'MOVE_OUT', '2026-12-01', NULL, '45 Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Chuyển công tác dài hạn vào TP. HCM', 2);

INSERT INTO temporary_residences
    (resident_id, household_id, record_type, start_date, end_date, location_address, reason, status, created_by)
VALUES
    (501, 101, 'TEMPORARY_ABSENCE', '2026-11-12', '2026-11-15', 'TP. Đà Nẵng', 'Đi công tác ngắn ngày', 'ACTIVE', 2),
    (503, 101, 'TEMPORARY_RESIDENCE', '2026-11-14', NULL, 'Quê quán: Nam Định', 'Người thân lên thăm gia đình chưa rõ ngày về', 'ACTIVE', 2);
