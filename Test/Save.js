// This method will return the width of a scrollbar.
function JSControls_getScrollerWidth()
{
    // Outer scrolling div
    var scr = document.createElement('div');
    scr.style.position = 'absolute';
    scr.style.top = '-1000px';
    scr.style.left = '-1000px';
    scr.style.width = '100px';
    scr.style.height = '50px';

    // Start with no scrollbar
    scr.style.overflow = 'hidden';

    // Inner content div
    var inn = document.createElement('div');
    inn.style.width = '100%';
    inn.style.height = '200px';

    // Put the inner div in the scrolling div
    scr.appendChild(inn);

    // Append the scrolling div to the doc 
    document.body.appendChild(scr);

    // Width of the inner div sans scrollbar
    var wNoScroll = inn.offsetWidth;

    // Add the scrollbar
    scr.style.overflow = 'auto';

    // Width of the inner div width scrollbar
    var wScroll = inn.offsetWidth;

    // Remove the scrolling div from the doc
    document.body.removeChild(
    document.body.lastChild);

    // Pixel width of the scroller
    return (wNoScroll - wScroll);
}

public SelectedValue(): string
{			
    var items: NodeList = this.BaseElement.getElementsByTagName('label');     	
    for (var index = 0; index < items.length; index++)
        if (items[index] instanceof HTMLLabelElement)
            if ((<HTMLLabelElement>items[index]).getAttribute('selected'))
                return (<HTMLLabelElement>items[index]).getAttribute('value');
        	
    return null;
}
