<?php
  date_default_timezone_set('Asia/Bahrain');
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  $sql = "SELECT * FROM `servers` WHERE `maintenanceDue` <= '".date('Y-m-d')."'";
  if(!$result = $mysqli->query($sql)){
    $mysqli->close();
    die("queryFailed");
  }

  if ($result->num_rows > 0){
    $emailSentence = "";
    // $emailSentence = "These Asset(s) has been outdated ";
    while($row = $result->fetch_assoc()){
      $emailSentence = $emailSentence . "<tr><td style='border:1px solid black;padding:4px;'>".$row["name"]."</td><td style='border:1px solid black;padding:4px;'>".date("d-m-Y", strtotime($row['maintenanceLast']))."</td><td style='border:1px solid black;padding:4px;'>".date("d-m-Y", strtotime($row['maintenanceDue']))."</td></tr>";
      // $emailSentence = $emailSentence . $row["assetID"] . "(for empID ".$row["empID"].") and ";
      // echo "<pre>";
      // print_r($row);
      // echo "</pre>";
    }
    // echo $emailSentence;
    require('res/PHPMailer.php');
    require('res/SMTP.php');
    $mail = new PHPMailer(true);
    $imagescontent= file_get_contents('/var/www/html/ISS/emailFooter.png');
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->Host       = "smtp.office365.com";
    $mail->SMTPAuth   = true;
    $mail->Username   = "systems@bfginternational.com";
    $mail->Password   = "Mad51922";
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
    $mail->addAddress('it@bfginternational.com');
    // $mail->addCC('it@bfginternational.com');
    $mail->isHTML(true);
    $mail->Subject = 'Servers Due For Maintenance: '.date('Y-m-d');
    $mail->Body       = 'The following Servers are Due for Maintenance:<br><br><table style="border:1px solid black;border-collapse: collapse;"><tr><th style="border:1px solid black;padding:4px;">Server Name</th><th style="border:1px solid black;padding:4px;">Last Maintenance</th><th style="border:1px solid black;padding:4px;">Maintenance Due</th></tr>'.$emailSentence.'</table><br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
    <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
    // $mail->Body    = 'The following Servers are Due for Maintenance:<br><br>'.$emailSentence.'<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
    // <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
    $mail->send();
  }
?>
