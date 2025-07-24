# Currency Conversion Tool 💱

A modern, responsive Angular application for real-time currency conversion with an intuitive user interface and robust error handling.
Demo: https://alancherkas.github.io/CurrencyConversionTool/currency-conversion

## 🌟 Features

- **Real-time Currency Conversion**: Convert between multiple currencies with live exchange rates
- **Debounced Input**: Smooth user experience with optimized API calls
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error management and user feedback
- **Auto-unsubscribe**: Memory leak prevention with automatic subscription cleanup
- **Material Design**: Clean, modern UI using Angular Material components

## 🚀 Technologies Used

- **Frontend**: Angular 20.1.2
- **UI Framework**: Angular Material 20.1.0
- **HTTP Client**: Angular HTTP Client for API communication
- **Reactive Forms**: FormGroup and FormControl for form management
- **RxJS**: Reactive programming with observables and operators
- **TypeScript**: Type-safe development
- **SCSS**: Advanced styling capabilities

## 🏗️ Project Architecture

```
src/
├── app/
│   ├── core/                    # Core functionality and utilities
│   │   ├── interceptors/        # HTTP interceptors
│   │   └── helpers/             # Helper functions and mixins
│   ├── pages/                   # Feature pages
│   │   └── currency-conversion/ # Main currency conversion feature
│   ├── services/                # Data services
│   ├── shared/                  # Shared components and utilities
│   │   ├── models/              # TypeScript interfaces and models
│   │   └── constants/           # Application constants
│   └── environments/            # Environment configurations
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v8 or higher)
- Angular CLI (v20.1.2)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlanCherkas/CurrencyConversionTool.git
   cd CurrencyConversionTool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

The application will automatically reload when you make changes to the source files.

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on `http://localhost:4200` |
| `npm run build` | Build the project for production |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests via Karma |
| `ng generate` | Generate new components, services, etc. |

## 🔧 Development

### Code Scaffolding

Generate new components and other Angular artifacts:

```bash
# Generate a new component
ng generate component component-name

# Generate a service
ng generate service service-name

# Generate other artifacts
ng generate directive|pipe|service|class|guard|interface|enum|module
```

### Build for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Unit Tests

Run unit tests with Karma test runner:

```bash
npm test
```

Tests are configured to run in watch mode by default during development.

### Testing Strategy

- **Component Testing**: Each component has corresponding `.spec.ts` files
- **Service Testing**: Services include unit tests for API interactions
- **Error Handling**: Tests cover error scenarios and edge cases

## 🌐 API Integration

The application integrates with [CurrencyBeacon API](https://currencybeacon.com/) for:

- **Currency List**: Fetching available currencies
- **Exchange Rates**: Real-time currency conversion rates

### Environment Configuration

Configure API settings in `src/environments/environment.ts`:

```typescript
export const environment = {
  ACCESS_TOKEN: 'your-api-token',
  BACKEND_URL: 'https://api.currencybeacon.com'
};
```

## 🎯 Key Features Implementation

### Auto-unsubscribe Mixin
Prevents memory leaks by automatically unsubscribing from observables:

```typescript
export class Component extends autoUnsubscribeMixin() {
  // Subscriptions are automatically cleaned up
}
```

### Debounced Input
Optimizes API calls with user input debouncing:

```typescript
this.form.valueChanges
  .pipe(debounceTime(DEBOUNCE_TIME_MS))
  .subscribe(/* handle changes */);
```

### Error Handling
Comprehensive error management with user-friendly messages and global error handling.

## 📱 Responsive Design

The application is fully responsive and provides an optimal user experience across:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Help

- **Angular CLI Help**: Run `ng help` or visit the [Angular CLI Documentation](https://angular.io/cli)
- **Angular Documentation**: [https://angular.io/docs](https://angular.io/docs)
- **Material Design**: [https://material.angular.io/](https://material.angular.io/)

## 📧 Contact

**Alan Cherkas** - [GitHub Profile](https://github.com/AlanCherkas)

---

⭐ **Star this repository if you found it helpful!**
