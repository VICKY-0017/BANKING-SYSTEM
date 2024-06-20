CREATE table customers(
    id serial primary key,
    name char(20),
    acnttype char(30) 
)

CREATE table amnt(
id SERIAL PRIMARY KEY,
name char(20),
amnt numeric(50)
)



CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);



INSERT INTO customers (name, accounttype) VALUES
('John Doe', 'Savings'),
('Jane Smith', 'Checking'),
('Robert Brown', 'Business'),
('Emily Davis', 'Savings'),
('Michael Johnson', 'Checking'),
('Sarah Wilson', 'Savings'),
('David Martinez', 'Business'),
('Laura Garcia', 'Checking'),
('James Anderson', 'Savings'),
('Olivia Lee', 'Business');




INSERT INTO amnt (name, amnt) VALUES 
('John Doe', 10000.00),
('Jane Smith', 20500.00),
('Robert Brown', 3000.00),
('Emily Davis', 4000.00),
('Michael Johnson', 5000.00),
('Sarah Wilson', 6000.00),
('David Martinez', 7000.00),
('Laura Garcia', 8000.00),
('James Anderson', 9000.00),
('Olivia Lee', 10000.00);

