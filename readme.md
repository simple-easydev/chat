1. server side
## install node package
 npm install
## run
 node server.js

 You can set port number in the .env file

 2.client side
 You can copy client directory to your hosting server's www directory

---index.php----
<?php 
	$SOCKET_SERVER = "http://localhost:3000";
?>
-----------------
in this file, please change localhost to your hosting server ip address.


