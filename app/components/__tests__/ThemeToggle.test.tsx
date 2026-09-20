import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle component', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    it('reflects the theme already applied to <html> by the pre-paint script', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        render(<ThemeToggle />);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
        );
    });

    it('toggles data-theme on <html> and persists the choice to localStorage', async () => {
        document.documentElement.setAttribute('data-theme', 'light');
        render(<ThemeToggle />);

        const button = await screen.findByRole('button', { name: /switch to dark mode/i });
        fireEvent.click(button);

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('vaultmind_theme')).toBe('dark');
        expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });
});
