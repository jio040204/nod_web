<%@page import="javax.servlet.jsp.tagext.TryCatchFinally"%>
<%@page import="java.sql.ResultSet"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>선생님정보</title>
</head>
<body>
    <% if(is_logined == false) { %>
    <table width="30%">
        <tr>
            <td><a href="/">Home</a></td>
            <td><a href="/t_login">login</a></td>
            <td><a href="/t_register">register</a></td>
        </tr>
    </table>

    <% }else{ %>

        <table width="30%">
            <tr>
                <td><a href="/">Home</a></td>
                <td><a href="/logout">logout</a></td>
            </tr>
        </table>
    <% } %>
    <h2>선생님정보목록</h2>
	<table>
		<thead>
			<tr>
				<th>학과이름</th>
				<th>학과 총 인원</th>
				<th>학과 개설년도</th>
				<th>학과정보</th>
				<th>학번</th>
				<th>학생이름</th>
				<th>학년</th>
				<th>성별</th>
			</tr>
		</thead>
		<tbody>
			<%
			sql = "SELECT * from TEACHER where m.majname = s.majname";
			
			ResultSet rs = conn.prepareStatement(sql).executeQuery();
		
			while(rs.next()){
			%>
				<tr>
					<td><%=rs.getString(1)%></td>
					<td><%=rs.getString(2)%></td>
					<td><%=rs.getString(3)%></td>
					<td><%=rs.getString(4)%></td>
					<td><%=rs.getString(5)%></td>
					<td><%=rs.getString(6)%></td>
					<td><%=rs.getString(7)%></td>
					<td><%=rs.getString(8)%></td>
				</tr>	
			<% 	
			}
			%>
			
		</tbody>
	</table>	
</body>
</html>