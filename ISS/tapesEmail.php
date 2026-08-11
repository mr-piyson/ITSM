<?php
  date_default_timezone_set('Asia/Bahrain');
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  $sql = "SELECT * FROM `tapes` WHERE `expire` != ''";
  //$sql = "SELECT * FROM `tapes` WHERE `expire` <= '".date('Y-m-d')."'";
  if(!$result = $mysqli->query($sql)){
    $mysqli->close();
    die("queryFailed");
  }

  if ($result->num_rows > 0){
    $emailSentence = "";
    $counter = 0;
    while($row = $result->fetch_assoc()){
      echo $row['expire']. " >> " .date('Y-m-d',strtotime($row['expire']." -90 days"))."\n";
      if(date('Y-m-d') == date('Y-m-d',strtotime($row['expire']." -90 days"))){
        $emailSentence = $emailSentence . "<tr><td style='border:1px solid black;padding:4px;'>".$row["tapeID"]."</td><td style='border:1px solid black;padding:4px;'>Seq. #".$row['sequenceNum']."  ".$row['month']."-".$row['year']."</td>
        <td style='border:1px solid black;padding:4px;'>".date("m/d/Y h:i A", strtotime($row['lastWritten']))."</td><td style='border:1px solid black;padding:4px;'>".date("m/d/Y h:i A", strtotime($row['expire']))."</td></tr>";
          $counter = $counter + 1;
        }
      }
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
      $mail->isHTML(true);
      $mail->Subject = 'Tapes Expiration Reminder';
      // $mail->Body    = 'The following Tapes are due to Expire soon:<br>'.$emailSentence.'<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
      $mail->Body       = 'The following Tapes are Due to Expire in 90 days:<br><br><table style="border:1px solid black;border-collapse: collapse;"><tr><th style="border:1px solid black;padding:4px;">Tape ID</th><th style="border:1px solid black;padding:4px;">Description</th><th style="border:1px solid black;padding:4px;">Last Written</th><th style="border:1px solid black;padding:4px;">Expiration Date</th></tr>'.$emailSentence.'</table><br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
      <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
      $mail->send();
    }
    if($counter == 0){
      echo date('Y-m-d')." ... No emails\n";
    }
?>
