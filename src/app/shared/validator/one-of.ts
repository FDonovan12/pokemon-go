export function oneOf<T extends readonly unknown[]>(values: T, message = 'Valeur invalide') {
    return (value: unknown) => (values.includes(value) ? null : { kind: 'oneOf', message });
}
