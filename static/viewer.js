var hotspotScheme = NGL.ColormakerRegistry.addScheme(function (params) {
	this.atomColor = function (atom) {
        var colour = "#ffffff";
        colour = structure3DApp.colorScaleInterface(atom.bfactor)
        colour = colour.replace("#", "0x");
        return colour;
	};
});

var structure3DApp = {
    viewer: null,
    component: null,
    viewerEl: null,
    pdbUri: null,

    initEvents() {
        let self = this;
        let v = self.viewer;
    },

    setDefault: function () {
        let self = this;
        self.viewer.setParameters({backgroundColor: 'white'});

        self.component.addRepresentation("cartoon", {
            name: 'current',
            colorScheme: document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value,
            quality: "high"
        });

        self.component.addRepresentation("surface", {
            name: 'surface',
            quality: "high",
            colorScheme: document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value,
            visible: $("input#showSurface").prop('checked'),
            opacity: 0.6,
        });

        if (document.getElementById('setColorScheme').value == 'hotspot')
            $("#legendInterfaceRow").show();
        else
            $("#legendInterfaceRow").hide();

        self.viewer.setQuality('high');
        self.component.autoView();

    },

    setReset: function () {
        let self = this;
        self.component.removeAllRepresentations();
        self.setDefault();
    },

    init: function (el, pdbUri) {
        let self = this;

        self.viewerEl = el;

        self.pdbUri = pdbUri;

        self.viewer = new NGL.Stage(self.viewerEl);
        self.viewer.loadFile(pdbUri).then(function (component) {
            self.component = component;
        }).then(function () {
            var scaleLinearHotspot = d3.scale.linear();
            var rangeColorsHotspot = ['#0d47a1', '#fff', '#f44336'];
            var colorScaleInterface = scaleLinearHotspot.domain([0.0,0.5,1.0]).range(rangeColorsHotspot);
            self.colorScaleInterface = colorScaleInterface;

            self.initEvents();
            self.setDefault();
        }).then(function(){
            $("#spinner").hide();
        });
        var tooltip = document.createElement('div');
        Object.assign(tooltip.style, {
            display: 'none',
            position: 'fixed',
            zIndex: 10,
            pointerEvents: 'none',
            backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
            color: 'lightgrey',
            padding: '8px',
            fontFamily: 'sans-serif'
        });
        document.body.appendChild(tooltip);
        self.viewer.mouseControls.remove('hoverPick');
        self.viewer.mouseControls.remove("drag-middle");
        self.viewer.signals.hovered.add(function (pickingProxy) {
            if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
                var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
                var mp = pickingProxy.mouse.position;
                tooltip.innerText = 'ATOM: ' + atom.qualifiedName();
                tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px';
                tooltip.style.left = mp.x + 3 + 'px';
                tooltip.style.display = 'block';
            } else {
                tooltip.style.display = 'none';
            }
        });

    }
};

$("a#spinViewer").on("click", function (e) {
    if($(this).hasClass("lighten-5")){
        $(this).removeClass("lighten-5");
        $(this).removeClass("blue-grey-text");
        $(this).addClass("white-text");
    }
    else{
        $(this).addClass("lighten-5");
        $(this).addClass("blue-grey-text");
        $(this).removeClass("white-text");
    }
    structure3DApp.viewer.toggleSpin();
});

$("a#screenshotViewer").on("click", function (e) {
    structure3DApp.viewer.makeImage({
        factor: 1,
        antialias: true,
        trim: false,
        transparent: true
    }).then(function (blob) {
        NGL.download(blob, "screenshot.png");
    });
});

$("a#fullscreenViewer").on("click", function (e) {
    structure3DApp.viewer.toggleFullscreen();

});

$("a#resetViewer").on("click", function (e) {
    structure3DApp.component.removeAllRepresentations();
    structure3DApp.setReset();
    $('select').prop('selectedIndex', 0);
});

$("select#setBgViewer").on("change",function (e) {
    structure3DApp.viewer.setParameters({backgroundColor: document.getElementById('setBgViewer').value});
});


$("select#setStyle").on("change", function (e) {
    structure3DApp.viewer.getRepresentationsByName('current').dispose();
    structure3DApp.component.addRepresentation(document.getElementById('setStyle').value, {
        name: 'current',
        quality: "high",
        colorScheme: document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value,
    });
    if (document.getElementById('setColorScheme').value == 'hotspot')
        $("#legendInterfaceRow").show();
    else
        $("#legendInterfaceRow").hide();
});


$("select#setColorScheme").on("change", function (e) {
    structure3DApp.viewer.getRepresentationsByName('current').dispose();
    structure3DApp.component.addRepresentation(document.getElementById('setStyle').value, {
        name: 'current',
        quality: "high",
        colorScheme: document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value,
    });
    structure3DApp.viewer.getRepresentationsByName('surface').setColor(document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value);

    if (document.getElementById('setColorScheme').value == 'hotspot')
        $("#legendInterfaceRow").show();
    else
        $("#legendInterfaceRow").hide();
});

$("input#showSurface").on("change", function (e) {
    var colorscheme =  document.getElementById('setColorScheme').value == 'hotspot' ? hotspotScheme : document.getElementById('setColorScheme').value;
    structure3DApp.viewer.getRepresentationsByName('surface').setVisibility($(this).prop('checked'));
    structure3DApp.viewer.getRepresentationsByName('surface').setColor(colorscheme);
    if ($(this).prop('checked'))
        $("#opacitySurface").show();
    else
        $("#opacitySurface").hide();

    if (document.getElementById('setColorScheme').value == 'hotspot')
        $("#legendInterfaceRow").show();
    else
        $("#legendInterfaceRow").hide();
});

$("#opacitySurface input").on("change", function (e) {
    structure3DApp.viewer.getRepresentationsByName('surface').setParameters({'opacity':$(this).val()});
    $("#opacitySurface span:eq(0)").text($(this).val());
});
