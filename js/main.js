import 'commonui/main';
import VueLogger from 'vuejs-logger';
import App from './App.vue';

window.addEventListener("load", () => {
    const options = {
        isEnabled: true,
        logLevel : 'error',
        stringifyArguments : false,
        showLogLevel : true,
        showMethodName : true,
        separator: '|',
        showConsoleColors: true
    };
    Vue.use(VueLogger, options);
    
    new Vue({
        el: '#app',
        render: h => h(App)
    });
});