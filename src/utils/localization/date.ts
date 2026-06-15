export const formatDateString = (rawDate: string) => {
    return new Date(rawDate).toLocaleDateString('en-US', {
        month:  'short',
        day:    'numeric',
        year:   'numeric',
    });
};