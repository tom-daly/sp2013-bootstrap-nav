SharePoint / Office 365 Client Side Navigation - Version 0.2 - 10/12/2015

GENERAL USAGE NOTES
--------------------
This code is specifically written to work on SharePoint 2013 on-prem, sandbox or Office 365. The purpose of this code is to replace the standard SharePoint navigation with a navigation that is Bootstrap v3 friendly.

Currently this navigation only supports using the Managed Meta Data navigation. Structural navigation is not supported because the SharePoint / O365 REST endpoints make it impossbile to implement correctly. 

This navigation will only support 2 levels, a top level and 1 drop down. Simply because at this time of this writing the current version of bootstrap v3.3.5 supports two levels. The code however, is written to loop through all the Managed Meta Data Navigation Nodes regardless. There are plenty of 3rd partys, plugins, and other users writting 3 or even 4 level flyouts that you could attempt to implement with this.

HOW TO USE
-----------
It's very simple to use. 

1) Add a link to the topNavigation.js file in your SharePoint masterpage.

2) Add the html snippet into the masterpage in the location you want the navigation to appear.







