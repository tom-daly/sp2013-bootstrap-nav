var topNav = window.topNav || {};

topNav = function () {

	var config = {
		siteUrl: "https://bandrdev.sharepoint.com/sites/bootstrap1",
		debug: false,
		targetSelector: "#my-top-navigation"
	};

	var loadNavigation = function () {
		$.when(getNavigationNodes()).done(function(navigationNodes) {
			renderNavigationNodes(navigationNodes, config.targetSelector);
			selectActiveNode();
		});
	};

	var selectActiveNode = function () {
		var path = window.location.pathname.toLowerCase();
		var decodedPath = decodeURI(path);
		$("ul.nav a").each(function (index, item) {
			var nodePath = $(this).attr("href").toLowerCase();
			if ($.trim(nodePath) === $.trim(decodedPath)) {
				$(this).addClass("active");
			}
		});
	};

	var renderNavigationNodes = function (navigationNodes, targetSelector) {
		var rootNode = $("<ul/>", { class: "nav navbar-nav" });

		$.each(navigationNodes, function (index, item) {
			var navNode = $("<a/>", { text: item.title, href: item.url, target: item.target });
			var navItem = $("<li/>");
			navItem.append(navNode);

			if(item.children.length > 0) {
				navNode.addClass("dropdown-toggle").attr("data-toggle","dropdown").attr("role","button").attr("aria-expanded","false");
				navItem.addClass("dropdown");

				var caret = $("<span/>", { class: "caret" });
				navNode.append(caret);

				var children = $("<ul/>", { class: "dropdown-menu", role: "menu"});
				$.each(item.children, function (index, child) {
					var childNode = $("<a/>", { text: child.title, href: child.url, target: child.target });
					var childItem = $("<li/>");
					childItem.append(childNode);
					children.append(childItem);
				});
				navItem.append(children);
			}

			rootNode.append(navItem);
		});

		$(targetSelector).html(rootNode);
	};

	var getNavigationNodes = function () {
		var deferred = $.Deferred();
		var queryUrl = config.siteUrl + "/_api/navigation/menustate?mapprovidername='GlobalNavigationSwitchableProvider'";
		var searchPromise = getSearchPromise(queryUrl);
		var navigationNodes = [];

		$.when(searchPromise).done(function (results) {
			var menuData = results.d.MenuState;

			if(menuData.StartingNodeTitle.length > 0) {
				navigationNodes.push({ title: menuData.StartingNodeTitle, url: menuData.SimpleUrl, target: "_self", children: []});
			}

			$.each(menuData.Nodes.results, function (index, item) {
				if(item.IsHidden) return;

				var targetObj = $.grep(item.CustomProperties.results, function (a) { return a.Key === "Target"; });
				var targetValue = targetObj[0].Value ? targetObj[0].Value : "_self";

				var childrenNodes = [];
				if(item.Nodes.results.length > 0) {
					$.each(item.Nodes.results, function (index, item) {
						var targetObj = $.grep(item.CustomProperties.results, function (a) { return a.Key === "Target"; });
						var targetValue = targetObj[0].Value ? targetObj[0].Value : "_self";

						childrenNodes.push({
							title: item.Title,
							url: item.SimpleUrl,
							target: targetValue
						});
					});
				}

				navigationNodes.push({
					title: item.Title,
					url: item.SimpleUrl,
					target: targetValue,
					children: childrenNodes
				});
			});

			deferred.resolve(navigationNodes);
		});
		
		return deferred.promise();
	};

	var getSearchPromise = function (queryUrl) {
		var deferred = $.Deferred();

		if(config.debug) {
			console.log(queryUrl);
		}

		$.ajax({
			url: queryUrl,
			headers: { "Accept": "application/json;odata=verbose" },
			contentType: "application/json;odata=verbose",
			method: "GET",
			success: function(data) {
				deferred.resolve(data);
			},
			error: function(err) {
				var errorMessage = err.responseJSON.error.message.value;
				deferred.reject(errorMessage);
			}
		});

		return deferred.promise();
	};

	return {
		LoadNavigation: loadNavigation
	};

}();

$(document).ready(function() {
	topNav.LoadNavigation();
});
