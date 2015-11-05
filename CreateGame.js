function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return unescape(dc.substring(begin + prefix.length, end));
}

function randomGameSession() {
	
	if(localStorage.sessionID == undefined) {
		var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
		var session = "";
		
		for(var i = 0; i < 8; i++) {
			session += chars.charAt(Math.random() * chars.length);
		}
		d = new Date();
		d.setTime(d.getDay() + 1);
		localStorage.setItem("sessionID", session);
		localStorage.setitem("date", d);
		document.getElementById("result").innerHTML = session;
	} 
	else {
		var x = localStorage.sessionID;
		document.getElementById("result").innerHTML = x;
	}
	
}