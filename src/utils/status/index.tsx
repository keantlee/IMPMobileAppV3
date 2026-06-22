export const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Completed':
            return { bg: '#E8F5E9', text: '#2E7D32' };
        case 'Pending':
            return { bg: '#FFF3E0', text: '#E65100' };
        case 'Re-Transact':
            return { bg: '#FFEBEE', text: '#C62828' }; 
        case 'Re-Upload':
            return { bg: '#E3F2FD', text: '#1565C0' }; 
        default:
            return { bg: '#EEEEEE', text: '#424242' };
    }
};