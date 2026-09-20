import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DepartmentChatDemo from '../DepartmentChatDemo';

describe('DepartmentChatDemo component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the department name and a preview badge, with no messages yet', () => {
        render(<DepartmentChatDemo departmentId="finance" departmentName="Finance" />);
        expect(screen.getByText('Finance — Main Chat Agent')).toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
        expect(screen.getByText(/ask finance anything/i)).toBeInTheDocument();
    });

    it('answers a suggested question with its matching canned response and source', async () => {
        render(<DepartmentChatDemo departmentId="finance" departmentName="Finance" />);

        fireEvent.click(screen.getByRole('button', { name: /who approves a new vendor contract/i }));

        // user bubble appears immediately
        expect(screen.getAllByText(/who approves a new vendor contract/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/is thinking/i)).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(screen.getByText(/department lead approves contracts under/i)).toBeInTheDocument();
        expect(screen.getByText(/Finance_Policy\.pdf/i)).toBeInTheDocument();
    });

    it('falls back to a generic preview answer for an unmatched typed question', async () => {
        render(<DepartmentChatDemo departmentId="hr" departmentName="Human Resources" />);

        const input = screen.getByPlaceholderText(/ask human resources a question/i);
        fireEvent.change(input, { target: { value: 'what color is the office carpet' } });
        fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(screen.getByText(/try one of the example questions above/i)).toBeInTheDocument();
    });

    it('disables input while a response is being "typed"', async () => {
        render(<DepartmentChatDemo departmentId="it" departmentName="IT Support" />);

        fireEvent.click(screen.getByRole('button', { name: /how do i request vpn access/i }));
        expect(screen.getByText(/is thinking/i)).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(1200);
        });

        expect(screen.queryByText(/is thinking/i)).not.toBeInTheDocument();
    });
});
