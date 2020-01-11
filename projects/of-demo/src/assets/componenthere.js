(function(window, showdown) {
    const getData = asset => {
        const xhr = new XMLHttpRequest(),
            url = `/assets/${asset}`;
        xhr.open('GET', url, false);
        xhr.send(null);

        if (xhr.status === 200) {
            return xhr.responseText;
        } else {
            throw new Error(`Bad url, ${url}`);
        }
    };

    window.hereMd = () => {
        const script = document.currentScript,
            componentName = script.getAttribute('render'),
            markdown = getData(componentName),
            component = document.createElement('div');

        component.classList.add('markdown-body');
        component.innerHTML = converter.makeHtml(markdown);

        script.parentNode.insertBefore(component, script);
    };

    window.hereNg = () => {
        const script = document.currentScript,
            componentName = script.getAttribute('render'),
            component = document.createElement(componentName);

        script.parentNode.insertBefore(component, script);
    };

    showdown.extension('ng', () => [
        {
            type: 'output',
            regex: /\{\{ng\.([^\}]+)\}\}/g,
            replace: (wholeMatch, componentName) => {
                return `<div class="app-component"><app-${componentName}></app-${componentName}><p><a href="https://github.com/gjcampbell/ooffice/blob/master/projects/of-demo/src/app/components/pages/${componentName}.component.ts">View example on github</a></p></div>`;
            }
        }
    ]);

    const converter = new showdown.Converter({ tables: true, extensions: ['ng', 'prettify'] });
})(window, showdown);
