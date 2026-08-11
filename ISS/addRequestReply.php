<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
  if (isset($_POST["requestID"]) && !empty($_POST["requestID"]) && (isset($_POST['replybox'])) && !empty($_POST['replybox']) && (isset($_POST['userID'])) && !empty($_POST['userID'])){
    date_default_timezone_set('Asia/Bahrain');
    $requestID = htmlspecialchars($_POST['requestID'], ENT_QUOTES);
    $user = htmlspecialchars($_POST['userID'], ENT_QUOTES);
    $requestreply = htmlspecialchars($_POST['replybox'], ENT_QUOTES);
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->correct_errno) {
      die("connectionFailed");
    }
    $input1 = mysqli_real_escape_string($mysqli, $requestID);
    $input2 = mysqli_real_escape_string($mysqli, $user);
    $input3 = mysqli_real_escape_string($mysqli, $requestreply);
    $sql2 = "INSERT INTO `requestReplies`(`requestID`, `reply`, `replyDate`, `userID`)
    VALUES (".$input1.", '".$input3."', STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'), ".$input2.")";
    if($mysqli->query($sql2) === TRUE){
      $sql3 = "SELECT users.name,users.email FROM requests
               LEFT JOIN users
               ON users.id = requests.user
               WHERE requests.id =".$requestID;
      if($result3 = $mysqli->query($sql3)){
        $row3 = $result3->fetch_array(MYSQLI_ASSOC);
        require('res/PHPMailer.php');
        require('res/SMTP.php');
        $mail = new PHPMailer(true);
        $imagescontent= file_get_contents('emailFooter.png');
        $mail->CharSet = 'UTF-8';
        $mail->isSMTP();
        $mail->Host       = "smtp.office365.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = "systems@bfginternational.com";
        $mail->Password   = "Mad51922";
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
        $mail->addAddress($row3["email"]);
        $mail->addCC('it@bfginternational.com');
        $mail->isHTML(true);
        $mail->Subject = 'IT Protal Request: '.$_POST["requestID"].'  -  New Reply  - '.date('d-m-Y h:i a');
        $mail->Body    = 'A new reply for your request was recieved.<br><br>"'.$_POST["replybox"].'"<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
        <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
        $mail->send();
      }
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
      die('<meta http-equiv="refresh" content="2;url=requestReplies.php?request='.$requestID.'" />');
    }else{
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
      die('<meta http-equiv="refresh" content="2;url=requestReplies.php?request='.$requestID.'" />');
    }
  }
}
?>
