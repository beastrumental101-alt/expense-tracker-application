# Expense Tracker Mobile App - Design Plan

## Overview

A personal finance app for tracking income and expenses with categorization and monthly summaries. Designed for single-handed use on mobile portrait orientation (9:16).

## Screen List

1. **Home Screen** — Dashboard with quick-add buttons, recent transactions, and monthly summary card
2. **Add Transaction Screen** — Form to log income or expense with amount, category, date, and notes
3. **Monthly Summary Screen** — Charts showing income vs expenses, category breakdown, and monthly statistics
4. **Transaction History Screen** — Scrollable list of all transactions with filtering by category and date range
5. **Settings Screen** — App preferences, currency selection, and data management

## Primary Content and Functionality

### Home Screen
- **Quick Add Buttons** — Two prominent buttons: "+ Income" and "+ Expense" (primary actions)
- **Monthly Overview Card** — Shows current month's total income, total expenses, and net balance
- **Recent Transactions List** — Last 5-10 transactions with category icon, description, amount, and date
- **Navigation Tabs** — Home, Summary, History, Settings

### Add Transaction Screen
- **Transaction Type Toggle** — Income or Expense (radio buttons or segmented control)
- **Amount Input** — Large, prominent number input field
- **Category Dropdown** — Pre-defined categories:
  - **Income**: Salary, Freelance, Investment, Bonus, Other
  - **Expense**: Food, Transport, Entertainment, Shopping, Bills, Health, Education, Other
- **Date Picker** — Default to today, allow selection of past/future dates
- **Notes Field** — Optional text for transaction description
- **Save Button** — Confirms and returns to home screen with success feedback

### Monthly Summary Screen
- **Month Selector** — Navigation to view previous/next months
- **Summary Cards** — Total Income, Total Expenses, Net Balance (with color coding: green for income, red for expenses)
- **Income vs Expense Chart** — Bar or pie chart showing proportion
- **Category Breakdown** — List of categories with amount and percentage of total spending
- **Trend Indicator** — Compare current month vs previous month

### Transaction History Screen
- **Filter Controls** — Filter by category, date range, or transaction type
- **Transaction List** — All transactions with swipe-to-delete (optional), category icon, amount, and date
- **Search** — Search by description or notes

### Settings Screen
- **Currency Selection** — Dropdown for currency symbol (USD, EUR, GBP, etc.)
- **Data Management** — Export transactions as CSV, clear all data (with confirmation)
- **App Info** — Version number and about section

## Key User Flows

### Flow 1: Log an Expense
1. User taps "+ Expense" on Home Screen
2. Add Transaction Screen opens with "Expense" pre-selected
3. User enters amount (e.g., 25.50)
4. User selects category (e.g., "Food")
5. User optionally adds notes (e.g., "Lunch at cafe")
6. User taps "Save"
7. Transaction saved, user returns to Home Screen with success feedback
8. Recent transactions list updates

### Flow 2: View Monthly Summary
1. User taps "Summary" tab
2. Monthly Summary Screen displays current month's data
3. User can swipe left/right or tap arrows to view previous/next months
4. Charts and category breakdown update dynamically
5. User can compare with previous month via trend indicator

### Flow 3: Search and Filter Transactions
1. User taps "History" tab
2. Transaction History Screen displays all transactions
3. User taps filter icon to open filter panel
4. User selects category (e.g., "Food") and date range
5. List filters in real-time
6. User can tap a transaction to view details or delete it

## Color Choices

- **Primary (Accent)**: `#0a7ea4` (Teal) — Used for buttons, highlights, and active states
- **Background**: `#ffffff` (Light) / `#151718` (Dark) — Screen background
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) — Cards and elevated surfaces
- **Foreground**: `#11181C` (Light) / `#ECEDEE` (Dark) — Primary text
- **Muted**: `#687076` (Light) / `#9BA1A6` (Dark) — Secondary text
- **Success**: `#22C55E` (Green) — Income, positive balance
- **Error**: `#EF4444` (Red) — Expenses, negative balance
- **Warning**: `#F59E0B` (Amber) — Alerts, important notices
- **Border**: `#E5E7EB` (Light) / `#334155` (Dark) — Dividers and borders

## Category Icons

Each category will use Material Icons:
- **Income**: `attach-money` (Salary), `trending-up` (Investment), `card-giftcard` (Bonus)
- **Expense**: `restaurant` (Food), `directions-car` (Transport), `movie` (Entertainment), `shopping-bag` (Shopping), `receipt` (Bills), `favorite` (Health), `school` (Education)

## Layout Principles

- **Single-handed use**: All interactive elements within thumb reach (bottom 60% of screen)
- **Large touch targets**: Minimum 44pt × 44pt for buttons and interactive elements
- **Whitespace**: Generous padding (16-24pt) between sections for visual clarity
- **Typography**: 
  - Headings: 24-28pt, bold
  - Body text: 16pt, regular
  - Labels: 14pt, medium
  - Small text: 12pt, regular
- **Animations**: Subtle transitions (200-300ms) for navigation and state changes
- **Haptic feedback**: Light haptic on button press, success notification on transaction save

## Data Persistence

- **Local Storage**: Use AsyncStorage for all transaction data (no cloud sync by default)
- **Schema**: 
  - Transaction: { id, type (income/expense), amount, category, date, notes, createdAt }
  - Categories: Pre-defined list stored in app state
  - Settings: Currency, theme preference
