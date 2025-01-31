export const stringArrayConverter = {
    fromAttribute: (value, type) => {
        return (value || '').split(',');
    },
    toAttribute: (value, type) => {
        return (value || []).join(',');
    }
};