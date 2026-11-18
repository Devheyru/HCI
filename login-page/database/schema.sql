DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

INSERT INTO students (student_id, password, full_name) VALUES
    ('0546/15', '$2b$10$DVoMtsvsBPeS2k4p8ugjiuN9LZAZX89r4cYDXMG298zHJhk/aS4vi', 'Heyru'),
    ('0540/15', '$2b$10$M4VFMNcdWXX7GWSbZ/VNFupGm5ola0LZB/36za72gWyNf9WK2rKHG', 'Henok'),
    ('0479/15', '$2b$10$/1Pqz58gTTmFJq.CdqnFkuvfas0/37LHPZzOyWfoJtkDS4klJotgy', 'Gemechu');
