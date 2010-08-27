<%@ page import="java.io.*" %>
<%@ page import="java.util.Date" %>
<%
  /*
  ' save.jsp
  ' -------- 
  ' Print the name that is passed in the
  ' 'name' POST parameter in a sentence  
  http://forum.java.sun.com/thread.jspa?threadID=792374&messageID=4503266
  */
  response.setContentType("text/plain");
%>
This is the data you just saved: <%= request.getParameter("name")  %> .
<%
String  filename = request.getRealPath("test.svg"); 
File file = new File(filename);
if(!file.exists())
file.createNewFile();

FileWriter fw = new FileWriter(file); //got file writer

String value = request.getParameter("name");

fw.write(value);

fw.close();

%>