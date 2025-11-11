import { getLoggedInUser, isAdmin, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
});

function injectHeader() {
    const headerPlaceholder = document.createElement('div');
    headerPlaceholder.innerHTML = `
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div class="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div class="flex gap-6 md:gap-10">
          <a href="/index.html" class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary">
                <path d="M14.5 7.5a2.5 2.5 0 0 1 5 0V8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V7.5Z"></path>
                <path d="M9.5 7.5a2.5 2.5 0 0 0-5 0V8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7.5Z"></path>
                <path d="M12 15a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0 0 5h1A2.5 2.5 0 0 0 12 15Z"></path>
                <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2a9.7 9.7 0 0 1 5.4.3"></path>
            </svg>
            <span class="inline-block font-bold text-lg font-headline">PawPals</span>
          </a>
          <nav class="flex gap-6"> <!-- Changed from hidden md:flex to flex -->
            <a href="/listings.html" class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Adopt
            </a>
          </nav>
        </div>
        <div class="flex flex-1 items-center justify-end space-x-4">
          <nav id="auth-nav" class="flex items-center space-x-2">
            <!-- Auth-related buttons will be injected here -->
          </nav>
        </div>
      </div>
    </header>
    `;
    document.body.prepend(headerPlaceholder);
    updateAuthNav();
}

function injectFooter() {
    const footerPlaceholder = document.createElement('div');
    footerPlaceholder.innerHTML = `
    <footer class="border-t">
      <div class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:h-24 md:flex-row md:py-0">
        <div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6 text-primary">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 13.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-7 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.5-7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
          <p class="text-center text-sm leading-loose md:text-left">
            Built by your friendly neighborhood AI.
          </p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-sm text-muted-foreground">&copy; ${new Date().getFullYear()} PawPals Inc.</p>
        </div>
      </div>
    </footer>
    `;
    document.body.appendChild(footerPlaceholder);
}

export function updateAuthNav() { // Export updateAuthNav
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    const user = getLoggedInUser();

    if (user) {
        // User is logged in, show profile/logout
        let dropdownHTML = `
            <div class="relative">
                <button id="user-menu-button" class="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    ${user.name ? user.name.charAt(0) : 'U'}
                </button>
                <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none z-50" role="menu">
                    <div class="flex flex-col space-y-1 p-2">
                      <p class="text-sm font-medium leading-none">${user.name || 'Welcome'}</p>
                      <p class="text-xs leading-none text-muted-foreground">${user.email}</p>
                    </div>
                    <div class="my-1 h-px bg-muted"></div> <!-- DropdownMenuSeparator -->
                    <a href="/index.html" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        <span>Home</span>
                    </a>
                    <a href="/profile.html" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Profile</span>
                    </a>
                    ${isAdmin() ? `
                    <a href="/admin/dashboard.html" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>Admin Dashboard</span>
                    </a>` : ''}
                    <div class="my-1 h-px bg-muted"></div> <!-- DropdownMenuSeparator -->
                    <a href="#" id="logout-button" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Log out</span>
                    </a>
                </div>
            </div>
        `;
        authNav.innerHTML = dropdownHTML;

        // Dropdown toggle logic
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenu = document.getElementById('user-menu');
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click from closing immediately
            userMenu.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (userMenu && !userMenu.contains(event.target) && !userMenuButton.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        });

        // Logout logic
        document.getElementById('logout-button').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            window.location.href = '/login.html';
        });

    } else {
        // User is not logged in, show login/signup
        authNav.innerHTML = `
            <a href="/login.html" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">Log in</a>
            <a href="/signup.html" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">Sign Up</a>
        `;
    }
}