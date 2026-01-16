import * as Sentry from '@sentry/react';

export class SentryLogger {
  private static initialized = false;

  static init(): void {
    if (this.initialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.VITE_ENV || 'development';

    if (!dsn) {
      console.warn('Sentry DSN not configured');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      integrations: [
         Sentry.browserTracingIntegration(),
         Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        if (environment === 'production') {
          const error = hint.originalException;
          if (error instanceof Error && 'isOperational' in error) {
            const isOperational = (error as { isOperational?: boolean }).isOperational;
            if (!isOperational) {
              return null;
            }
          }
        }
        return event;
      },
    });

    this.initialized = true;
  }

  static captureException(error: Error, context?: Record<string, unknown>): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  static setUser(user: { id: string; email: string; username: string } | null): void {
    Sentry.setUser(user);
  }
}