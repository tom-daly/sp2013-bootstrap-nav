// Bootstrap Top Navigation script for SP2013/SP2016
// Author: Thomas Daly
// Date: 8/4/2017
// Version: 0.6

var topNav = window.topNav || {};

topNav = function () {

	var config = {
		siteUrl: null, // blank siteUrl node, this will try to auto-determine
		targetSelector: null, // init top level target selector as null
		storageCacheKey: "topNavigation",
		useCache: false		
	};

	var generateHash = function (key) {
		var hash = 0,
			i, chr;
		if (key.length === 0) return hash;
		for (i = 0; i < key.length; i++) {
			chr = key.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	var getStoredNav = function () {
		if (typeof (Storage) !== "undefined") {
			var navItems = sessionStorage.getItem(config.storageCacheKey);
			var navItemsObj = JSON.parse(navItems);
			return navItemsObj;
		} else return "";
	};

	var setStoredNav = function (obj) {
		if (typeof (Storage) !== "undefined") {
			sessionStorage.setItem(config.storageCacheKey, JSON.stringify(obj));
		}
	};

	var loadNavigation = function (targetSelector) {
		// store the detected site url to a global variable
		config.siteUrl = _spPageContextInfo.siteAbsoluteUrl;
		// store the passed in target selector node
		config.targetSelector = targetSelector;

		var storedNav = getStoredNav();
		if (!storedNav || storedNav.length <= 0 || !config.useCache) {
			// create the promise to retrieve the navigation nodes
			var getNodesPromise = getManagedNavigationNodes();
			// when the navigation nodes are returned proccede
			$.when(getNodesPromise).done(function (navigationNodes) {
				$(config.targetSelector).addClass("fresh");
				setStoredNav(navigationNodes);
				// render the returned navigation nodes to the screen into the target selector
				renderNavigationNodes(navigationNodes, config.targetSelector);
				// select the active navigation node
				selectActiveNode();
			});
		} else {
			$(config.targetSelector).addClass("cached");
			renderNavigationNodes(storedNav, config.targetSelector);
		}
	};

	var selectActiveNode = function () {

		// get the browse url path and lower case it
		var path = window.location.pathname.toLowerCase();
		// decode any special characters
		var decodedPath = decodeURI(path);
		// read each navigation node item
		$(config.targetSelector).find("a").each(function (index, item) {
			// get the href property
			var href = $(this).attr("href");
			// if no href break out of loop
			if(!href) return;
			// lower case the href property
			var nodePath = href.toLowerCase();
			// trim the path & decoded path and compare them
			if ($.trim(nodePath) === $.trim(decodedPath)) {
				// if they are the same add the selected class
				$(this).addClass("active");
			}
		});

	};

	var renderNavigationNodes = function (navigationNodes, targetSelector, isSub, parentFriendlyUrlSegement) {

	// assign the node group properties, if sub then make a drop down, else it's the root node
		var nodeGroupProps = isSub ? { "class": "dropdown-menu", role: "menu" } : { "class": "nav navbar-nav" };
		// create the node group <ul> object in jQuery, assign it the properties
		var nodeGroup = $("<ul/>", nodeGroupProps);
		// append the node group to the target selector, might be the root <ul> or a child <ul> (dropdown)
		$(targetSelector).append(nodeGroup);

		// iterate each navigation node and add to the node group above
		$.each(navigationNodes, function (index, item) {
            
			// skip item if it has the hidden property
			if(item.IsHidden) return;

			//set boolean variable if the node has children
			var hasChildren = item.Nodes.results.length >= 1;

			// nullify the targetValue
			var targetValue = null;
			// if the node has custom properties, check for Target, otherwise skip
			if(item.CustomProperties.length > 0) {
				// scan the item's property array for "Target", if found return that value
				var targetObj = $.grep(item.CustomProperties.results, function (a) { return a.Key === "Target"; });
				// if a targetValue was return use that otherwise use "_self" (default)
				targetValue = targetObj[0].Value ? targetObj[0].Value : "_self";
			}

			// assign the navigation node properties, if is has children assign bootstrap drop down properties, if no children then blank property object
			var navNodeProps = hasChildren ? { "class": "dropdown-toggle", "data-toggle": "dropdown", "role": "button", "aria-haspopup": "true", "aria-expanded": "false" } : {};
            
            // if a parent friendly url was passed in use that to concatenate the links
            var friendlyUrlSegment = parentFriendlyUrlSegement ? parentFriendlyUrlSegement + "/" + item.FriendlyUrlSegment : config.siteUrl + "/" + item.FriendlyUrlSegment;
            // asign the navigation node url, if the simple link is set use that, otherwise url the friendly url segment
            var navNodeUrl =  item.NodeType === 0 ? item.SimpleUrl : friendlyUrlSegment; //NodeType 0 = Simple Url, NodeType 1 = Friendly Url

            var navNode = null;
            if(item.NodeType === 0 && item.SimpleUrl.length <= 0) {
                // extending the navNodeProps object to contain the following values. These are the values that are the same with or without children
                $.extend(navNodeProps, {
                    text: item.Title
                });
                // create the navigation node <a> object in jQuery, assign it the properties
                navNode = $("<span/>",  navNodeProps);
            }
            else {
                // extending the navNodeProps object to contain the following values. These are the values that are the same with or without children
                $.extend(navNodeProps, {
                    text: item.Title, // the title of the navigation item
                    href: navNodeUrl, // the url of the navigation item
                    target: targetValue // the target value of the url item (open in new window)
                });
                // create the navigation node <a> object in jQuery, assign it the properties
                navNode = $("<a/>",  navNodeProps);
            }

			// create a caret <span> object in jQuery
			var caret = $("<span/>", { "class": "caret" });
			// if this current navigation node has children, add a caret
			if(hasChildren) {
				// append the drop caret to the navigation node
				navNode.append(caret);
			}

			// assign the navigation item properties, if it has children then give it a bootstrap dropdown class, if no children then a blank property object
			var navItemProps = hasChildren ? { "class": "dropdown" } : {};
			// extending the navItemProps object to contain an ID. These are the values that are the same with or without children
			$.extend(navItemProps, {
				id: generateHash(item.Title) // give the navigation item a unique ID
			});
			// create the navigation item <li> object in jQuery, ass it the properties
			var navItem = $("<li/>", navItemProps);
			// append the navigation node <a> into the navigation item <li>
			navItem.append(navNode);

			// append the navigation item <li> into it's parent group
			nodeGroup.append(navItem);
            
			// if the current navigation item has children, rescursively calls this function
			if(hasChildren) {
				// call the function with the children nodes, the id of the current <li>, and true 
				renderNavigationNodes(item.Nodes.results, "#" + navItemProps.id, true, friendlyUrlSegment);
			}
		});

	};

	var getManagedNavigationNodes = function () {

		// create a deferred function
		var deferred = $.Deferred();
		// define the query url to retrive the navigation nodes
		var queryUrl = config.siteUrl + "/_api/navigation/menustate?mapprovidername='GlobalNavigationSwitchableProvider'";
		
		// generate the search promise
		var searchPromise = getSearchPromise(queryUrl);

		// when the search promise completes, do work with the results
		$.when(searchPromise).done(function (results) {
			// resolve the deferred with the navigation nodes portion of the results of the search 
			deferred.resolve(results.d.MenuState.Nodes.results);
		});
		
		// return the promise
		return deferred.promise();

	};

	var getSearchPromise = function (queryUrl) {

		//create a deferred function
		var deferred = $.Deferred();

		// construct the ajax call
		$.ajax({
			url: queryUrl, // passed in queryUrl
			headers: { "Accept": "application/json;odata=verbose" }, // standard headers
			contentType: "application/json;odata=verbose", // standard contentType
			method: "GET", // standard method to get data
			success: function(data) {
				// on success return the data
				deferred.resolve(data);
			},
			error: function(err) {
				// on error return the error message
				var errorMessage = err.responseJSON.error.message.value;
				deferred.reject(errorMessage);
			}
		});

		// return the promise
		return deferred.promise();

	};

	return {
		loadNavigation: loadNavigation
	};

}();

$(document).ready(function() {
	// when doc ready call the load navigation function
	topNav.loadNavigation("#my-top-navigation");  // the top level div where to put the navgiation nodes
});