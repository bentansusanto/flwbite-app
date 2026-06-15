describe('Login Page', () => {
  it('should load the login page and show the form', () => {
    cy.visit('/login')
    cy.get('input[name="identifier"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.contains('button', /Masuk sebagai Staff/i).should('be.visible')
  })

  it('submitting empty form should show validation errors or remain on page', () => {
    cy.visit('/login')
    cy.contains('button', /Masuk sebagai Staff/i).click()
    cy.url().should('include', '/login')
  })
})
