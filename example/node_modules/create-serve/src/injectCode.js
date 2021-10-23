import { eventSource } from './index.js';

const injectCode = () => `
    <script>
        (() => new EventSource('${eventSource}').onmessage = () => location.reload())();
    </script>
`;

export default injectCode;
