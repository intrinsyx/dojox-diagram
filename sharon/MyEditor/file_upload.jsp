<html>
 
<!-- reference: http://www.developershome.com/wap/wapUpload/wap_upload.asp?page=jsp3 -->

  <head>
    <title>File Upload Example</title>
  </head>
  
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.ServletFileUpload" %>
<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory" %>
<%@ page import="org.apache.commons.io.FilenameUtils" %>
<%@ page import="java.util.*" %>
<%@ page import="java.io.File" %>
<%@ page import="java.lang.Exception" %>
<%@ page import="java.lang.*" %>

<% response.setContentType("text/html"); %>

  <body>
    <h1>Data Received at the Server</h1>
     <p>

<%

if (ServletFileUpload.isMultipartContent(request)){
  ServletFileUpload servletFileUpload = new ServletFileUpload(new DiskFileItemFactory());
  List fileItemsList = servletFileUpload.parseRequest(request);

  String optionalFileName = "";
  FileItem fileItem = null;

  Iterator it = fileItemsList.iterator();
  while (it.hasNext()){
    FileItem fileItemTemp = (FileItem)it.next();
    if (fileItemTemp.isFormField()){
%>

<b>Name-value Pair Info:</b><br/>
Field name: <%= fileItemTemp.getFieldName() %><br/>
Field value: <%= fileItemTemp.getString() %><br/><br/>

<%
      if (fileItemTemp.getFieldName().equals("filename"))
        optionalFileName = fileItemTemp.getString();
    }
    else
      fileItem = fileItemTemp;
  }

  if (fileItem!=null){
    String fileName = fileItem.getName();
%>

<b>Uploaded File Info:</b><br/>
Content type: <%= fileItem.getContentType() %><br/>
Field name: <%= fileItem.getFieldName() %><br/>
File name: <%= fileName %><br/>
File size: <%= fileItem.getSize() %><br/><br/>

<%
    /* Save the uploaded file if its size is greater than 0. */
    if (fileItem.getSize() > 0){
      if (optionalFileName.trim().equals(""))
        fileName = FilenameUtils.getName(fileName);
      else
        fileName = optionalFileName;

      String dirName = request.getRealPath("/file_uploads/");
		
      File saveTo = new File(dirName +"/"+ fileName);
      try {
        fileItem.write(saveTo);
        System.out.println("the file path and name:"+dirName+", "+fileName);
        
%>

<b>The uploaded file has been saved successfully. The file path is:</b>
<%= dirName+"/"+fileName %> 

<%
      }
      catch (Exception e){
      System.out.println("Error!");
%>

<b>An error occurred when we tried to save the uploaded file.</b>
 
 </p>
 
<%
      }%>

 <textarea id="responsetext"> <%= fileName %> </textarea>
 
<%      
    }
  }
}
%>

   
    
    
  </body>
</html>
