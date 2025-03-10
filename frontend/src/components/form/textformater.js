export default function textToSnakecase(str) {
    return str
        .trim() // Remove leading and trailing spaces
        .toLowerCase() // Convert string to lowercase
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-z0-9_]+/g, '') // Remove non-alphanumeric characters except underscores
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}