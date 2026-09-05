function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        }

function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('cwa_theme', theme);
            const icon = document.getElementById('themeIcon');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-moon';
                } else {
                    icon.className = 'fas fa-sun';
                }
            }
        }
