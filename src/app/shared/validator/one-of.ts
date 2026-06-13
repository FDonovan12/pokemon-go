import { SchemaPath, validate } from '@angular/forms/signals';

export function oneOf<T>(path: SchemaPath<T>, values: readonly T[], options?: { message?: string }): void {
    validate(path, ({ value }) => {
        return values.includes(value()) ? null : { kind: 'oneOf', message: options?.message ?? 'Valeur invalide' };
    });
}
