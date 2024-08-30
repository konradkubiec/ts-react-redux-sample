// Remember to configure your Cypress baseUrl in cypress.json to point to localhost:3000
describe('User Authentication', () => {
		beforeEach(() => {
			cy.visit('/');
		});
	
		context('Registration', () => {
			it('should allow a new user to register', () => {
				cy.get('a[href="/register"]').click();
				cy.get('#name').type('New User');
				cy.get('#email').type('newuser@example.com');
				cy.get('#password').type('password123');
				cy.get('#confirmPassword').type('password123');
				cy.get('button[type="submit"]').click();
	
				cy.url().should('include', '/login');
				cy.contains('Registration successful').should('be.visible');
			});
	
			it('should show an error for invalid input', () => {
				cy.get('a[href="/register"]').click();
				cy.get('#name').type('A');	// Too short
				cy.get('#email').type('invalid-email');
				cy.get('#password').type('short');
				cy.get('button[type="submit"]').click();
	
				cy.contains('Name must be at least 2 characters').should('be.visible');
				cy.contains('Invalid email address').should('be.visible');
				cy.contains('Password must be at least 6 characters').should('be.visible');
			});
		});
	
		context('Login', () => {
			it('should allow a registered user to log in', () => {
				cy.get('a[href="/login"]').click();
				cy.get('#email').type('user@example.com');
				cy.get('#password').type('password123');
				cy.get('button[type="submit"]').click();
	
				cy.url().should('include', '/dashboard');
				cy.contains('Welcome, User').should('be.visible');
			});
	
			it('should show an error for invalid credentials', () => {
				cy.get('a[href="/login"]').click();
				cy.get('#email').type('user@example.com');
				cy.get('#password').type('wrongpassword');
				cy.get('button[type="submit"]').click();
	
				cy.contains('Invalid email or password').should('be.visible');
			});
		});
	
		context('User Details', () => {
			beforeEach(() => {
				// Log in before each test in this context
				cy.login('user@example.com', 'password123');
			});
	
			it('should display user details on the dashboard', () => {
				cy.visit('/dashboard');
				cy.contains('Name: Test User').should('be.visible');
				cy.contains('Email: user@example.com').should('be.visible');
			});
		});
	
		context('Logout', () => {
			beforeEach(() => {
				cy.login('user@example.com', 'password123');
			});
	
			it('should allow a user to log out', () => {
				cy.visit('/dashboard');
				cy.get('button').contains('Logout').click();
				cy.url().should('include', '/login');
				cy.visit('/dashboard');	// Try to access protected route
				cy.url().should('include', '/login');	// Should be redirected to login
			});
		});
	});
	
	// cypress/support/commands.js
	Cypress.Commands.add('login', (email, password) => {
		cy.request('POST', '/api/user/login', { email, password })
			.then((response) => {
				window.localStorage.setItem('token', response.body.token);
			});
	});