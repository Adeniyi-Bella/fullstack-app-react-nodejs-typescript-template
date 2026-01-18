describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.contains('An unexpected error occurred', { timeout: 5000 }).should('be.visible');
  });

  it('should successfully login with valid credentials and access the dashboard', () => {
    cy.intercept('POST', '/api/v1/users/login', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: {
            userId: 'user-123',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            plan: 'free',
          },
          token: 'fake-jwt-token',
        },
      },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Welcome back');
  });

  it('should navigate to register page', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/register');
    cy.contains('Create Accounts');
  });
});