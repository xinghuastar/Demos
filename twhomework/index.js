window['DOMLIB'] = {};

function addEvent(node, type, listener) {
    if (node.addEventListener) {
        // W3C method
        node.addEventListener(type, listener, false);
        return true;
    } else if (node.attachEvent) {
        // MSIE method
        node['e' + type + listener] = listener;
        node[type + listener] = function() { node['e' + type + listener](window.event); }
        node.attachEvent('on' + type, node[type + listener]);
        return true;
    }

    // Didn't have either so return false
    return false;
};
window['DOMLIB']['addEvent'] = addEvent;

function removeEvent(node, type, listener) {
    if (node.removeEventListener) {
        node.removeEventListener(type, listener, false);
        return true;
    } else if (node.detachEvent) {
        // MSIE method
        node.detachEvent('on' + type, node[type + listener]);
        node[type + listener] = null;
        return true;
    }
    // Didn't have either so return false
    return false;
};
window['DOMLIB']['removeEvent'] = removeEvent;

function delegate(delegateNode, type, listener) {
    DOMLIB['addEvent'](document, type, function(event) {
    	event = event || window.event;
        for (var target = event.target; target && target != this; target = target.parentNode) {
            // loop parent nodes from the target to the delegation node
            if (target.matches( delegateNode)) {
                listener.call(target, event);
                break;
            }
        }
        event.stopPropagation();
    });
}
window['DOMLIB']['delegate'] = delegate;
function preventDefault(eventObject) {
    eventObject = eventObject || getEventObject(eventObject);
    if (eventObject.preventDefault) {
        eventObject.preventDefault();
    } else {
        eventObject.returnValue = false;
    }
}
window['DOMLIB']['preventDefault']=preventDefault;
function stopPropagation(eventObject){
     eventObject = eventObject || getEventObject(eventObject);
     if(eventObject.bubbles){
     	eventObject.stopPropagation();
     }else{
     	eventObject.cancelBubble = true;
     }
}
function getEventObject(W3CEvent) {
    return W3CEvent || window.event;
}
window['DOMLIB']['getEventObject'] = getEventObject;

function addClass(node,className){
	if(!node) return false;
	if(node.className){
		if(node.className.indexOf(className)<=-1){
			node.className = ' '+className;
		}
	}else{
		node.className = className;
	}
	return true;
}

window['DOMLIB']['addClass'] = addClass;
function removeClass(node,className){
	if(!node) return false;
	if(node.className){
		node.className = node.className.indexOf(className)>-1?node.className.replace(className,""):"";
	}
	return true;

}
window['DOMLIB']['removeClass'] = removeClass;
function getRequestObject(url, options) {

    // Initialize the request object
    var req = false;
    if (window.XMLHttpRequest) {
        var req = new window.XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var req = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    if (!req) return false;

    // Define the default options
    options = options || {};
    options.method = options.method || 'GET';
    options.send = options.send || null;

    // Define the various listeners for each state of the request
    req.onreadystatechange = function() {
        switch (req.readyState) {
            case 1:
                // Loading
                if (options.loadListener) {
                    options.loadListener.apply(req, arguments);
                }
                break;
            case 2:
                // Loaded
                if (options.loadedListener) {
                    options.loadedListener.apply(req, arguments);
                }
                break;
            case 3:
                // Interactive
                if (options.ineractiveListener) {
                    options.ineractiveListener.apply(req, arguments);
                }
                break;
            case 4:
                // Complete
                // if aborted FF throws errors
                try {
                    console.log("status:" + status);
                    if ((req.status && req.status == 200) || (!req.status && req.responseText)) {
                        if (options.jsonResponseListener) {
                            try {
                                var json = JSON.parse(req.responseText);
                            } catch (e) {
                                var json = false;
                            }
                            options.jsonResponseListener.call(
                                req,
                                json
                            );
                        }

                        // A complete listener
                        if (options.completeListener) {
                            options.completeListener.apply(req, arguments);
                        }

                    } else {
                        // Response completed but there was an error
                        if (options.errorListener) {
                            options.errorListener.apply(req, arguments);
                        }
                    }



                } catch (e) {

                    console.log("exe error");
                }
                break;
        }
    };
    // Open the request
    req.open(options.method, url, true);
    // Add a special header to identify the requests
    req.setRequestHeader('X-ADS-Ajax-Request', 'AjaxRequest');
    return req;
}
window['DOMLIB']['getRequestObject'] = getRequestObject;

/**
 * send an XMLHttpRequest using a quick wrapper around the
 * getRequestObject and the send method. 
 */
function ajaxRequest(url, options) {
    var req = getRequestObject(url, options);
    return req.send(options.send);
}
window['DOMLIB']['ajaxRequest'] = ajaxRequest;


var template_header = '';
template_navbar = '';
template_header = template_header + '<div class="header">' +
    '<div class="area-wrap">' +
    '<div class="building-area">' +
    '<span class="type">Building</span>' +
    '<span class="icon-cog"></span>' +
    ' <span class="count">{{numOfBuilding}}</span>' +
    '</div>' +
    '</div>' +
    '<div class="area-wrap">' +
    '<div class="idle-area">' +
    '<span class="type">Idle</span>' +
    '<span class="icon-coffee"></span>' +
    '<span class="count">{{numOfIdle}}</span>' +
    '</div>' +
    '</div>' +
    '<div class="area-wrap">' +
    '<div class="badge-area">' +
    '<ul class="badgeList">' +
    '<li class="badgeItem">' +
    '<div class="badgeName">ALL</div>' +
    '<div class="badgeCount">{{total}}</div>' +
    '</li>' +
    '<li class="badgeItem">' +
    '<div class="badgeName">PHYSICAL</div>' +
    '<div class="badgeCount">{{numOfPhysical}}</div>' +
    '</li>' +
    '<li class="badgeItem">' +
    '<div class="badgeName">VERTUAL</div>' +
    '<div class="badgeCount">{{numOfVertual}}</div>' +
    '</li>' +
    '</ul>' +
    '</div>' +
    '</div>' +
    '</div>';

template_navbar = template_navbar + '<div class="navbarWrapper"><div class="navbar">' +
    '<ul class="nav">' +
    ' <li class="item "><a class="active" href="#">All</a></li>' +
    '<li class="item"><a href="#">Physical</a></li>' +
    '<li class="item"><a href="#">Virtual</a></li>' +
    '</ul>' +
    '<div class="search-area">' +
    '<span class="icon-search"></span>' +
    '<input type="text" name="">' +
    '</div>' +
    '<div class="menus">' +
    '<span class="menu icon-th-card"></span>' +
    '<span class="menu icon-th-list"></span>' +
    '</div>' +
    '</div></div>';

function Cruise() {

}
var cruise = (function() {
    var container = document.getElementById("mainContent");
    var resList;
    return {
        container: container,
        getResList: function(){
        	return resList;
        },
        setResList: function(list){
        	resList = list;
        },
        init: function() {
            var nav = document.querySelector('.sideBar .nav');
            var agentMenu = nav.querySelector('li:nth-child(2)');
            agentMenu.focus();
            this.render('agent');
            addEvent(nav, 'click', function() {
                var target = event.target;

                cruise.render(target.id)
            });
        },
        render: function(type) {
            var url = "";
            //get data
            switch (type) {
                case "agent":
                    url = './data/resources.json';
                    break;
                default:
                    this.container.innerHTML = "";
                    return;

            }
            ajaxRequest(url, {
                'method': 'get',
                'send': null,
                'jsonResponseListener': function(json) {
                    console.log(json);
                    cruise.setResList(json.resources);
                    cruise.renderAgentArea(json);
                }
            });
            //console.log(res);
        },
        renderAgentArea: function(data) {
            // var res = data.res;
            var html = '';
            //header
            template_header = template_header.replace('{{numOfBuilding}}', data.numOfBuilding);
            template_header = template_header.replace('{{numOfIdle}}', data.numOfIdle);
            template_header = template_header.replace('{{total}}', data.total);
            template_header = template_header.replace('{{numOfPhysical}}', data.numOfPhysical);
            template_header = template_header.replace('{{numOfVertual}}', data.numOfVertual);
            html = html + template_header + template_navbar + this.renderResList(data.resources);
            //navbar 
            this.container.innerHTML = html;

            // Options for the observer (which mutations to observe)
            /*            var config = { attributes: true, childList: true };
                        console.log( this.container);

                        // Callback function to execute when mutations are observed
                        var callback = function(mutationsList) {
                            for (var mutation of mutationsList) {
                                if (mutation.type === 'childList') {
                                	console.log("changed");
                                    var eles = this.container.querySelectorAll(".mainContent .listWrapper .item .detail .platform .addPlatform");
                                    if (eles && eles.length) {
                                        for (var i = 0, len = eles.length; i < len; i++) {
                                            DOMLIB['addEvent'](eles[i], 'click', cruise.addPlatform);
                                        }
                                    }
                                } else if (mutation.type === 'attributes') {
                                    console.log('The ' + mutation.attributeName + ' attribute was modified.');
                                }
                            }
                        };

                        // Create an observer instance linked to the callback function
                        var observer = new MutationObserver(callback);

                        // Start observing the target node for configured mutations
                        observer.observe(this.container, config);

                        // Later, you can stop observing
                        //observer.disconnect();*/
            console.log(this.container);
            var eles = this.container.querySelectorAll("#mainContent .listWrapper .list .item");
            console.log(eles);
/*            if (eles && eles.length) {
                for (var i = 0, len = eles.length; i < len; i++) {
                	 DOMLIB['delegate'](eles[i], 'click', cruise.dispatchHandler);
                }
            }*/
            DOMLIB['delegate']("#mainContent .listWrapper .list .item", 'click', cruise.dispatchHandler);

        },
        dispatchHandler: function(event){
        	event = event || window.event;
        	 DOMLIB['preventDefault'](event);
        	// event.target.getAttribute("data-js");
        	 switch(event.target.getAttribute("data-js")){
        	 	case "addRes":
        	 	    cruise.addPlatform(this);
        	 	    break;
        	 	case "subRes":
        	 	    cruise.submitAdd(this);
        	 	    break;
        	 	case "delPlat":
        	 	   cruise.deletePlatform(this,event);
        	 	   break;
        	 }


        },
        addPlatform: function(currItem) {
            //show conrresponding dialog
            DOMLIB['removeClass'](cruise.container.querySelector('#dialog'+currItem.id),"hidden");
            console.log(currItem.id);
              
        },
        submitAdd: function(currItem) {
        	var id = currItem.id;
        	var inputEle = currItem.querySelector(".input-res");
        	var value = currItem.querySelector(".input-res").value;
        	if(!value) return false;
        	var plats = value.split(',');
        	if(plats && plats.length){
        		var platformlistEle = currItem.querySelector(".platformlist");
        		var html = '';
        		for(var i=0,len=plats.length;i<len;i++){
        			this.getResList()[id].platforms.push(plats[i]);
        			html = html + '<li><span>' + plats[i] + '</span><span class="icon-trash"></span></li>'
        		} 
        		//reset the input value
        	inputEle.value="";
        	//refresh view
        	 platformlistEle.innerHTML = platformlistEle.innerHTML + html;
        	 // hidden modal
        	 currItem.querySelector(".modal").classList.add("hidden");
        	}
        	

        },
        deletePlatform: function(currItem,event) {
        	var arr = this.getResList()[currItem.id].platforms;
        	arr.splice(arr.indexOf(event.target.previousSibling.textContent || event.target.previousSibling.textContent.innerText),1);
        	// refresh view
        	event.target.parentElement.parentElement.removeChild(event.target.parentElement);
        	console.log(event.target.previousSibling);
        },
        renderResList: function(resources) {
            var html = ' <div class="listWrapper"><ul class="list">';
            var list = "";
            for (var i = 0, len = resources.length; i < len; i++) {
                var res = resources[i];
                list = list + '<li class="item" id="'+i+'">' +
                    '<div class="logo"><img src="' + res.logo + '"></div>' +
                    '<div class="detail">' +
                    '<ul class="infolist">' +
                    '<li><span class="icon-desktop"></span><span>' + res.domain + '</span></li>' +
                    '<li><span>' + res.status + '</span></li>' +
                    '<li><span class="icon-info"></span><span>' + res.ip + '</span></li>' +
                    '<li><span class="icon-folder"></span><span>' + res.path + '</span></li>' +
                    '</ul>';
                list = list + '<div class="platform"><a class=" addPlat icon-plus js-addRes" data-js="addRes" href="" id="' + i + '"></a>';
                var plats = res.platforms;
                if (plats && plats.length) {
                    list = list + '<div class="platformWrapper"><ul class="platformlist">';
                    var platStr = '';
                    for (var j = 0; j < plats.length; j++) {
                        platStr = platStr + '<li><span>' + plats[j] + '</span><span class="icon-trash" data-js="delPlat"></span></li>'
                    }
                    list = list + platStr + '</ul></div></div>';
                }
                list = list + '<div class="deny"><span class="icon-deny"></span><span>Deny</span></div></div>';
                list = list + '<div class="modal hidden" id="dialog'+i+'">' +
                    '<div class="modal-header">' +
                    '<p>Separate multiple resource name with commas</p>'+
                '<span class="close icon-close"></span>'+
                ' </div>'+
                '<div class="modal-body">'+
                '<input class="input-res" type="text" placeholder="Input value" />'+
                '</div>'+
                '<footer class="modal-footer">'+
                '<a class="button btn-add js-subRes" data-js="subRes">Add Resources</a>'+
                '<a class="button btn-cancel js-cancel" data-js="cancel">Cancel</a>'+
                ' </footer>'+
                ' </div>';
            }

            html = html + list + '</ul></div>';
            return html;
        }
    }
})();

cruise.init();
