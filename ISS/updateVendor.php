<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["name"]) && !empty($_POST["name"])){
      date_default_timezone_set('Asia/Bahrain');
      $vendorName = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $vendorNotes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $vendorID = htmlspecialchars($_POST['vendorID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $vendorName);
      $input2 = mysqli_real_escape_string($mysqli, $vendorNotes);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $input4 = mysqli_real_escape_string($mysqli, $vendorID);
      $sql = "UPDATE `vendors` SET `name`='".$input1."',`notes`='".$input2."' WHERE `id`=".$input4;
      if(count($_FILES) > 0){
        if ($_FILES['file']['error'] !== 0){
          die("failedUpload1");
        }
        $info = getimagesize($_FILES['file']['tmp_name']);
        if ($info === FALSE){
          die("failedUpload2");
        }
        if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
          die("failedUpload3");
        }

        if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/itemsImages/vendor".$vendorID."_".$_FILES["file"]["name"])){
          die("failedUpload4");
        }else{
          $imagePath = "/var/www/html/ISS/itemsImages/vendor".$vendorID."_".$_FILES["file"]["name"];
          if($info[0] > 1000){
            $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }elseif($info[1] > 1000){
            $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }
          $sql = "UPDATE `vendors` SET `name`='".$input1."',`notes`='".$input2."',`image`='vendor".$vendorID."_".$_FILES["file"]["name"]."' WHERE `id`=".$input4;
        }
      }
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`)
        VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','vendor',".$input4.")";
        $mysqli->query($sqlLog);
        $sqlDel = "DELETE FROM `vendorsContacts` WHERE `vendorID`=".$input4;
        $mysqli->query($sqlDel);
        if(isset($_POST["contactType"])){
          for ($i=0;$i<count($_POST["contactType"]);$i++){
            if(!empty($_POST['contactName'][$i]) && !empty($_POST['contactValue'][$i])){
              $contactName = htmlspecialchars($_POST['contactName'][$i], ENT_QUOTES);
              $contactPositon = htmlspecialchars($_POST['contactPositon'][$i], ENT_QUOTES);
              $contactType = htmlspecialchars($_POST['contactType'][$i], ENT_QUOTES);
              $contactValue = htmlspecialchars($_POST['contactValue'][$i], ENT_QUOTES);
              $input5 = mysqli_real_escape_string($mysqli, $contactName);
              $input6 = mysqli_real_escape_string($mysqli, $contactType);
              $input7 = mysqli_real_escape_string($mysqli, $contactValue);
              $input8 = mysqli_real_escape_string($mysqli, $contactPositon);
              $sql2 = "INSERT INTO `vendorsContacts`(`vendorID`, `contactType`, `contactName`, `contact`, `personPosition`) VALUES (".$input4.",'".$input6."','".$input5."','".$input7."','".$input8."')";
              if($mysqli->query($sql2) === FALSE){
                die("failed");
              }
            }
          }
        }
        die("updated");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>
