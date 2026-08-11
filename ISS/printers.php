<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <script>
        var printerNamesForSearch = [];
        var printerLocationForSearch = [];
        var printerUsedByForSearch = [];
        function triggerView(){
          document.getElementById('printerSearchInput').value = "";
          for (let x=0;x<document.getElementsByClassName('printersBlocks').length;x++){
            document.getElementsByClassName('printersBlocks')[x].style.display = "block";
          }
          document.getElementById("resultP").innerHTML = "Printers ("+document.getElementsByClassName('printersBlocks').length+")";
          if(document.getElementById("printerBlocksDiv").style.display != "none"){
            document.getElementById("printerBlocksDiv").style.display = "none";
            document.getElementById("printerReportDiv").style.display = "block";
          }else{
            document.getElementById("printerBlocksDiv").style.display = "block";
            document.getElementById("printerReportDiv").style.display = "none";
          }
        }
        function printerSearch(e){
          if ((document.getElementById('printerSearchInput').value.trim().length > 1)){
            for (let x=0;x<document.getElementsByClassName('printersBlocks').length;x++){
              document.getElementsByClassName('printersBlocks')[x].style.display = "none";
            }
            var counter = 0;
            for (var i=0;i<printerNamesForSearch.length;i++){
              if (printerNamesForSearch[i].toUpperCase().includes(document.getElementById("printerSearchInput").value.trim().toUpperCase()) || printerLocationForSearch[i].toUpperCase().includes(document.getElementById("printerSearchInput").value.trim().toUpperCase()) || printerUsedByForSearch[i].toUpperCase().includes(document.getElementById("printerSearchInput").value.trim().toUpperCase())){
                for (let n=0;n<document.getElementsByClassName('printersBlocks').length;n++){
                  if(n == i){
                    document.getElementsByClassName('printersBlocks')[n].style.display = "block";
                    counter = counter + 1;
                  }
                }
              }
            }
            document.getElementById("resultP").innerHTML = "Printers ("+counter+")";
            document.getElementById("printerBlocksDiv").style.display = "block";
            document.getElementById("printerReportDiv").style.display = "none";
          }else{
            for (let x=0;x<document.getElementsByClassName('printersBlocks').length;x++){
              document.getElementsByClassName('printersBlocks')[x].style.display = "block";
            }
            document.getElementById("resultP").innerHTML = "Printers ("+document.getElementsByClassName('printersBlocks').length+")";
            document.getElementById("printerBlocksDiv").style.display = "block";
            document.getElementById("printerReportDiv").style.display = "none";
          }
        }
        function tableViewTrigger(){
          if(document.getElementById("printerReportDiv").style.display == "block"){
            if(document.getElementById("reportTable").style.width == "100%"){
              document.getElementById("reportTable").style.width = "auto";
              document.getElementById("compactImg").src = "compact2.png";
            }else{
              document.getElementById("reportTable").style.width = "100%";
              document.getElementById("compactImg").src = "compact.png";
            }
          }
        }
      </script>
      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <label style="color:#0b5266;">Search</label>
          <input id="printerSearchInput" onkeyup="printerSearch(event)" type="text" class="w3-input w3-border">
          <a onclick="triggerView()" class="w3-right w3-text-grey" style="cursor:pointer;">List/Blocks</a>
          <p id="resultP" class="w3-text-grey" style="margin:0;">Printers ()</p>
          <div style="background:url('compact2.png')"></div>
        </div>
      </div>
      <?php
      $sql2 = "SELECT * FROM `printers` WHERE `inActive` = 0";
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        echo "<div class='w3-container w3-margin'><a href='addNewPrinter.php' class='w3-btn w3-border w3-small'>Add new printer</a></div>";
        $printersTable = "<div id='printerReportDiv' style='display:none;padding-bottom:40px;padding-left:32px;padding-right:32px;' class='w3-container w3-row'><a class='w3-text-grey' style='cursor:pointer;' onclick='tableViewTrigger()'><img style='width:24px;' id='compactImg' src='compact.png' /></a>";
        $printersTable = $printersTable ."<table id='reportTable' style='width:100%;margin:0 auto;' class='w3-table w3-table-all'><tr style='background:#128cae;color:#fff;'><th style='padding:16px;'>Image</th><th style='padding:16px;'>Name</th><th style='padding:16px;'>Location</th><th style='padding:16px;'>Used By</th><th style='padding:16px;'></th></tr>";
        echo "<div id='printerBlocksDiv' style='padding-bottom:40px;' class='w3-container w3-row'>";
        $printerNameJS = "";
        $printerLocationJS = "";
        $printerUsedByJS = "";
        while($row2 = $result2->fetch_assoc()){
          echo "<div class='w3-quarter w3-padding printersBlocks'><div class='w3-light-grey w3-padding'>";
          if(!empty($row2["img"])){
            echo "<img class='w3-right blockImages' style='width:25%;max-height:90px;' data-src='http://iss.bfginternational.com/ISS/printersImages/".$row2['img']."' />";
          }
          echo "<h4 style='text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["name"]."</h4>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["location"]."</p>";
          echo "<p class='w3-text-grey' style='margin:0;'>".$row2["usedBy"]."</p>";
          echo "<div style='text-align:right;'><a href='printerDetails.php?id=".$row2["id"]."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></div>";
          echo "</div></div>";
          $imageTable = "";
          if(!empty($row2["img"])){
            $imageTable = "<img class='w3-right tableImages' style='height:50px;' data-src='http://iss.bfginternational.com/ISS/printersImages/".$row2['img']."' />";
          }
          $printersTable = $printersTable."<tr><td style='width:80px;'>".$imageTable."</td><td style='padding:16px;'>".$row2["name"]."</td>
          <td style='padding:16px;'>".$row2["location"]."</td><td style='padding:16px;'>".$row2["usedBy"]."</td><td style='padding:16px;'>
          <a href='printerDetails.php?id=".$row2["id"]."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></td></tr>";
          $printerNameJS = $printerNameJS . "'".$row2["name"]."',";
          $printerLocationJS = $printerLocationJS . "'".$row2["location"]."',";
          $printerUsedByJS = $printerUsedByJS . "'".$row2["usedBy"]."',";
        }
        echo "</div>";
        $printersTable = $printersTable . "</table></div>";
        echo $printersTable;
        ?>
        <script>
          window.onload = function(){
            document.getElementById("resultP").innerHTML = "Printers ("+document.getElementsByClassName('printersBlocks').length+")";
            printerNamesForSearch = [<?php echo $printerNameJS; ?>];
            printerLocationForSearch = [<?php echo $printerLocationJS; ?>];
            printerUsedByForSearch = [<?php echo $printerUsedByJS; ?>];
            for (let i=0;i<document.getElementsByClassName("blockImages").length;i++){
              document.getElementsByClassName("blockImages")[i].src = document.getElementsByClassName("blockImages")[i].getAttribute("data-src");
            }
            for (let i=0;i<document.getElementsByClassName("tableImages").length;i++){
              document.getElementsByClassName("tableImages")[i].src = document.getElementsByClassName("tableImages")[i].getAttribute("data-src");
            }
          }
        </script>
        <?php
      }else{
        echo "no Printers";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
