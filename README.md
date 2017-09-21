SharePoint 2013 / 2016 / Office 365 - Bootstrap Client Side Navigation<br/>
8/4/2017 v0.6

GENERAL USAGE NOTES
--------------------
The purpose of this code is to replace the standard SharePoint navigation with a navigation that is Bootstrap v3 friendly.

Currently this navigation only supports using the Managed Meta Data navigation. Structural navigation is not supported because the SharePoint / O365 REST endpoints make it impossbile to implement correctly. 

This navigation will only support 2 levels, a top level and 1 drop down. Simply because at this time of this writing the current version of bootstrap v3.3.5 supports two levels. The code however, is written to loop through all the Managed Meta Data Navigation Nodes regardless. There are plenty of 3rd partys, plugins, and other users writting 3 or even 4 level flyouts that you could attempt to implement with this.

HOW TO USE
-----------
It's very simple to use. 

1) Add a link to the topNavigation.js file in your SharePoint masterpage.

2) Add the html snippet into the masterpage in the location you want the navigation to appear.

3) Set properties in config variable. Located in the top of the javascript file you can enable/disable the session storage but setting the config value 'useCache' to either true or false.

Optional: using Bootstrap CSS cause some conflicts from SharePoint. I've provided my typical file that helps to reset many of those unwanted effects.
CHANGE LOG
-----------
v0.7 - changed top level node to be "span" if containing children nodes. Removed global targetSelector field and using parameter passing. Added selectActiveNode to run after cache or fresh execution. Added navigationProvider configuration setting so that it could be flipped for either global nav or left navigation. Added sharepoint-bootstrap-resets.css.
v0.6 - solved issue #3 - remove link for nodes with no url specified in SimpleUrl<br/>
v0.5 - enhancements: changed unique key for each node to use a hash value of the title (allows targeting for css). Added browser caching w/ config value to enable/disable it.<br/>
v0.4 - fixes: children with friendly urls inherit the segement of the parent<br/>
v0.3 - fixes: parent/child relation broke using non-unique property. added unique key for each node.






