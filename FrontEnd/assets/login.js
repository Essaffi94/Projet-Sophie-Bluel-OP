// Gestion de la connexion
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Récupérer le message d'erreur
    const errorMessage = document.getElementById('error-message');
    
    // Masquer le message d'erreur précédent
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Stocker le token dans le localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            
            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            // Afficher le message d'erreur sous le formulaire
            errorMessage.textContent = 'Erreur : vérifier votre identifiant ou votre mot de passe';
            errorMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        // Afficher un message d'erreur en cas de problème réseau
        errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
        errorMessage.style.display = 'block';
    }
});
