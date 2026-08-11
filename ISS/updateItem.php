<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["name"]) && !empty($_POST["name"])){
      date_default_timezone_set('Asia/Bahrain');
      $itemName = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $itemBrand = htmlspecialchars($_POST['brand'], ENT_QUOTES);
      $itemStock = htmlspecialchars($_POST['stock'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $itemID = htmlspecialchars($_POST['itemID'], ENT_QUOTES);
      $category = htmlspecialchars($_POST['category'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $itemName);
      $input2 = mysqli_real_escape_string($mysqli, $itemBrand);
      $input3 = mysqli_real_escape_string($mysqli, $itemStock);
      $input4 = mysqli_real_escape_string($mysqli, $user);
      $input5 = mysqli_real_escape_string($mysqli, $itemID);
      $input6 = mysqli_real_escape_string($mysqli, $category);
      $sql = "UPDATE `items` SET `name`='".$input1."',`stock`='".$input3."',`brand`='".$input2."',`category`='".$input6."' WHERE `id`=".$input5;
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

        if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/itemsImages/item".$itemID."_".$_FILES["file"]["name"])){
          die("failedUpload4");
        }else{
          $imagePath = "/var/www/html/ISS/itemsImages/item".$itemID."_".$_FILES["file"]["name"];
          if($info[0] > 1000){
            $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }elseif($info[1] > 1000){
            $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }
          $sql = "UPDATE `items` SET `name`='".$input1."',`stock`='".$input3."',`brand`='".$input2."',`img`='item".$itemID."_".$_FILES["file"]["name"]."' WHERE `id`=".$input5;
        }
      }
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input4.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','item',".$input5.")";
        $mysqli->query($sqlLog);
        die("added");
      }else{
        die("failed");
      }
      $mysqli -> close();
    }
  }
?>
