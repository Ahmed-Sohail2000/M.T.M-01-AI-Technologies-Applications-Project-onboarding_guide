import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../Pagination';

describe('Pagination component', () => {
    it('renders nothing when there is only one page', () => {
        const { container } = render(<Pagination page={1} pageCount={1} onPageChange={jest.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a numbered button per page and a mobile "Page X of Y" label', () => {
        render(<Pagination page={2} pageCount={3} onPageChange={jest.fn()} />);
        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    it('marks the current page with aria-current', () => {
        render(<Pagination page={2} pageCount={3} onPageChange={jest.fn()} />);
        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
    });

    it('disables Previous on the first page and Next on the last page', () => {
        const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={jest.fn()} />);
        expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();

        rerender(<Pagination page={3} pageCount={3} onPageChange={jest.fn()} />);
        expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('calls onPageChange with the target page when a page button is clicked', () => {
        const onPageChange = jest.fn();
        render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByRole('button', { name: '3' }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with page + 1 when Next is clicked', () => {
        const onPageChange = jest.fn();
        render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
