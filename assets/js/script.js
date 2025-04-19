$(document).ready(function() {
    // ************************************************
    // Initialize draggable elements in toolbar
    // ************************************************
    $('.draggable-element').draggable({
        helper: 'clone',
        revert: 'invalid',
        zIndex: 100
    });

    // ************************************************
    // Initialize droppable playground
    // ************************************************
    $('#playground').droppable({
        accept: '.draggable-element',
        drop: function(event, ui) {
            const type = ui.draggable.data('type');
            const offset = $(this).offset();
            const position = {
                left: ui.offset.left - offset.left,
                top: ui.offset.top - offset.top
            };
            
            createElement(type, position);
        }
    });

    // ************************************************
    // Create a new element in the playground
    // ************************************************
    function createElement(type, position) {
        let element;
        const id = 'element-' + Date.now();
        
        switch(type) {
            case 'text':
                element = $(`<div class="playground-element text-element" id="${id}" data-type="text">
                    Double click to edit text
                </div>`);
                element.css({
                    width: '150px',
                    height: 'auto',
                    backgroundColor: '#fff9e6'
                });
                break;
                
            case 'img':
                element = $(`<div class="playground-element image-element" id="${id}" data-type="img">
                    <img src="./assets/images/placeholder.jpg" alt="Image">
                </div>`);
                element.css({
                    width: '150px',
                    height: '150px'
                });
                break;
                
            case 'shape':
                element = $(`<div class="playground-element shape-element" id="${id}" data-type="shape">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="#e6f3ff" stroke="#4ba3c7" stroke-width="2"/>
                    </svg>
                </div>`);
                element.css({
                    width: '150px',
                    height: '150px'
                });
                break;
        }
        
        element.css({
            position: 'absolute',
            left: position.left + 'px',
            top: position.top + 'px'
        });

        element.draggable({
            containment: '#playground',
            stop: updatePropertiesPanel
        });
        
 
        element.click(function(e) {
            e.stopPropagation();
            $('.playground-element').removeClass('selected');
            $(this).addClass('selected');
            updatePropertiesPanel(null, { helper: $(this) });
        });
 
        if (type === 'text') {
            element.dblclick(function() {
                const currentText = $(this).text().trim();
                $(this).html(`<textarea class="text-edit">${currentText}</textarea>`);
                const textarea = $(this).find('.text-edit');
                textarea.focus();
                
                textarea.blur(function() {
                    const newText = $(this).val();
                    $(this).parent().html(newText || 'Double click to edit text');
                    updatePropertiesPanel();
                });
                
                textarea.keypress(function(e) {
                    if (e.which === 13) {
                        $(this).blur();
                    }
                });
            });
        }
      
        element.find('.resize-handle').draggable({
            containment: '#playground',
            helper: function() { return $('<div></div>'); },
            drag: function(event, ui) {
                const parent = $(this).parent();
                const width = ui.position.left + 10;
                const height = ui.position.top + 10;
                
                parent.css({
                    width: width + 'px',
                    height: height + 'px'
                });
                
                if (parent.data('type') === 'text') {
                    parent.css('height', 'auto');
                }
            },
            stop: updatePropertiesPanel
        });
        
        $('#playground').append(element);
        element.click();
    }
    // ************************************************
    // Update properties panel based on selected element
    // ************************************************
    function updatePropertiesPanel(event, ui) {
        const element = ui ? ui.helper : $('.playground-element.selected');
        if (element.length === 0) return;
        
        const type = element.data('type');
        let formHtml = '';
        
        const width = element.css('width');
        const height = element.css('height');
        
        formHtml += `
            <div class="property-group">
                <label for="element-width">Width</label>
                <input type="${type}" id="element-width" value="${width}">
            </div>
            <div class="property-group">
                <label for="element-height">Height</label>
                <input type="${type}" id="element-height" value="${height}">
            </div>
        `;
        
        
        switch(type) {
            case 'text':
                const fontFamily = element.css('font-family');
                const fontSize = element.css('font-size');
                const isBold = element.css('font-weight') === '700';
                const isItalic = element.css('font-style') === 'italic';
                const isUnderlined = element.css('text-decoration') === 'underline';
                
                formHtml += `
                    <div class="property-group">
                        <label for="text-font-family">Font Family</label>
                        <select id="text-font-family">
                            <option value="Arial, sans-serif" ${fontFamily.includes('Arial') ? 'selected' : ''}>Arial</option>
                            <option value="Times New Roman, serif" ${fontFamily.includes('Times') ? 'selected' : ''}>Times New Roman</option>
                            <option value="Courier New, monospace" ${fontFamily.includes('Courier') ? 'selected' : ''}>Courier New</option>
                            <option value="Georgia, serif" ${fontFamily.includes('Georgia') ? 'selected' : ''}>Georgia</option>
                            <option value="Verdana, sans-serif" ${fontFamily.includes('Verdana') ? 'selected' : ''}>Verdana</option>
                        </select>
                    </div>
                    <div class="property-group">
                        <label for="text-font-size">Font Size</label>
                        <input type="text" id="text-font-size" value="${fontSize}">
                    </div>
                    <div class="property-group">
                        <label>
                            <input type="checkbox" id="text-bold" ${isBold ? 'checked' : ''}> Bold
                        </label>
                        <label>
                            <input type="checkbox" id="text-italic" ${isItalic ? 'checked' : ''}> Italic
                        </label>
                        <label>
                            <input type="checkbox" id="text-underline" ${isUnderlined ? 'checked' : ''}> Underline
                        </label>
                    </div>
                    
                `;
                break;
                
            case 'img':
                const imgSrc = element.find('img').attr('src');
                
                formHtml += `
                    <div class="property-group">
                        <label for="image-src">Image URL</label>
                        <input type="text" id="image-src" value="${imgSrc}">
                    </div>
                    <div class="property-group">
                        <label for="image-alt">Alt Text</label>
                        <input type="text" id="image-alt" value="${element.find('img').attr('alt') || ''}">
                    </div>
                `;
                break;
                
            case 'shape':
                const svgPath = element.find('path').attr('d') || 'M20,20 L80,20 L80,80 L20,80 Z';
                
                
                formHtml += `
                    <div class="property-group">
                        <label for="shape-path">SVG Path</label>
                        <textarea id="shape-path">${svgPath}</textarea>
                    </div>
                  
                `;
                break;
        }
        
        formHtml += `<button id="apply-properties">Apply Changes</button>`;
        $('#properties-form').html(formHtml);
        // ************************************************
        // Set up event listeners for property changes
        // ************************************************
        $('#apply-properties').click(function() {
            applyProperties(element);
        });
    }
    // ************************************************
    // Apply properties from the form to the element
    // ************************************************
    function applyProperties(element) {
        const type = element.data('type');
        
        
        element.css({
            width: $('#element-width').val(),
            height:  $('#element-height').val()
        });
        
        
        switch(type) {
            case 'text':
                element.css({
                    'font-family': $('#text-font-family').val(),
                    'font-size': $('#text-font-size').val(),
                    'font-weight': $('#text-bold').is(':checked') ? 'bold' : 'normal',
                    'font-style': $('#text-italic').is(':checked') ? 'italic' : 'normal',
                    'text-decoration': $('#text-underline').is(':checked') ? 'underline' : 'none'
                    
                });
                break;
                
            case 'img':
                element.find('img').attr({
                    src: $('#image-src').val(),
                    alt: $('#image-alt').val()
                });
                break;
                
            case 'shape':
                element.find('svg path').attr({
                    d: $('#shape-path').val()
                });
                break;
        }
    }
    // ************************************************
    // Click on playground to deselect elements
    // ************************************************
    $('#playground').click(function(e) {
        if ($(e.target).hasClass('playground')) {
            $('.playground-element').removeClass('selected');
            $('#properties-form').html('<p>Select an element to edit its properties</p>');
        }
    });
    
});