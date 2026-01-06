// Gestion de la connexion
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
            alert('Erreur dans l\'identifiant ou le mot de passe');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur de connexion au serveur');
    }
});
