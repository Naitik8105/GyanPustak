CREATE DATABASE IF NOT EXISTS gyanpustak;
USE gyanpustak;

CREATE TABLE person (
  person_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  address VARCHAR(255)
);

CREATE TABLE student (
  person_id INT PRIMARY KEY,
  date_of_birth DATE,
  university_affiliation VARCHAR(150),
  major VARCHAR(100),
  student_status VARCHAR(30),
  current_year_of_study INT,
  FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE employee (
  person_id INT PRIMARY KEY,
  gender VARCHAR(20),
  salary DECIMAL(10,2),
  aadhaar_number VARCHAR(20) UNIQUE,
  FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE customer_support (
  person_id INT PRIMARY KEY,
  FOREIGN KEY (person_id) REFERENCES employee(person_id) ON DELETE CASCADE
);

CREATE TABLE administrator (
  person_id INT PRIMARY KEY,
  FOREIGN KEY (person_id) REFERENCES employee(person_id) ON DELETE CASCADE
);

CREATE TABLE super_admin (
  person_id INT PRIMARY KEY,
  FOREIGN KEY (person_id) REFERENCES administrator(person_id) ON DELETE CASCADE
);

CREATE TABLE user_account (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','employee','customer_support','administrator','super_admin') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE university (
  university_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255),
  representative_first_name VARCHAR(50),
  representative_last_name VARCHAR(50),
  representative_email VARCHAR(100),
  representative_phone VARCHAR(20)
);

CREATE TABLE department (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  university_id INT NOT NULL,
  FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE
);

CREATE TABLE instructor (
  instructor_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  university_id INT NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE CASCADE
);

CREATE TABLE course (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(150) NOT NULL,
  university_id INT NOT NULL,
  FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE
);

CREATE TABLE course_offering (
  offering_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  department_id INT NOT NULL,
  instructor_id INT NOT NULL,
  academic_year VARCHAR(20),
  semester VARCHAR(20),
  FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id) ON DELETE CASCADE
);

CREATE TABLE book (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  isbn VARCHAR(30) UNIQUE,
  publisher VARCHAR(150),
  publication_date DATE,
  edition_number VARCHAR(20),
  language VARCHAR(50),
  book_type VARCHAR(20),
  purchase_option VARCHAR(20),
  format VARCHAR(30),
  price DECIMAL(10,2),
  quantity INT DEFAULT 0,
  category VARCHAR(100),
  subcategory VARCHAR(100)
);

CREATE TABLE author (
  author_id INT AUTO_INCREMENT PRIMARY KEY,
  author_name VARCHAR(150) NOT NULL
);

CREATE TABLE keyword (
  keyword_id INT AUTO_INCREMENT PRIMARY KEY,
  keyword_text VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE book_author (
  book_id INT,
  author_id INT,
  PRIMARY KEY (book_id, author_id),
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES author(author_id) ON DELETE CASCADE
);

CREATE TABLE book_keyword (
  book_id INT,
  keyword_id INT,
  PRIMARY KEY (book_id, keyword_id),
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES keyword(keyword_id) ON DELETE CASCADE
);

CREATE TABLE course_book (
  offering_id INT,
  book_id INT,
  added_by_admin_id INT NOT NULL,
  required_or_recommended VARCHAR(30),
  PRIMARY KEY (offering_id, book_id),
  FOREIGN KEY (offering_id) REFERENCES course_offering(offering_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (added_by_admin_id) REFERENCES administrator(person_id) ON DELETE CASCADE
);

CREATE TABLE cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(person_id) ON DELETE CASCADE
);

CREATE TABLE cart_item (
  cart_id INT,
  book_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (cart_id, book_id),
  FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  cart_id INT UNIQUE,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_fulfilled TIMESTAMP NULL,
  shipping_type VARCHAR(30),
  credit_card_number VARCHAR(30),
  credit_card_expiration_date VARCHAR(20),
  credit_card_holder_name VARCHAR(100),
  credit_card_type VARCHAR(30),
  order_status VARCHAR(30),
  FOREIGN KEY (student_id) REFERENCES student(person_id) ON DELETE CASCADE,
  FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE SET NULL
);

CREATE TABLE order_item (
  order_id INT,
  book_id INT,
  quantity INT NOT NULL,
  unit_price_at_purchase DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, book_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE
);

CREATE TABLE review (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  rating INT NOT NULL,
  review_text TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_book (student_id, book_id),
  FOREIGN KEY (student_id) REFERENCES student(person_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE
);

CREATE TABLE trouble_ticket (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50),
  title VARCHAR(150) NOT NULL,
  problem_description TEXT NOT NULL,
  solution_description TEXT,
  date_logged TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP NULL,
  current_status VARCHAR(30),
  created_by_student_id INT NULL,
  created_by_support_id INT NULL,
  assigned_admin_id INT NULL,
  resolved_admin_id INT NULL,
  FOREIGN KEY (created_by_student_id) REFERENCES student(person_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_support_id) REFERENCES customer_support(person_id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_admin_id) REFERENCES administrator(person_id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_admin_id) REFERENCES administrator(person_id) ON DELETE SET NULL
);

CREATE TABLE ticket_status_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by_employee_id INT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES trouble_ticket(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_employee_id) REFERENCES employee(person_id) ON DELETE CASCADE
);
