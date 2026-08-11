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
        var itemNamesForSearch = [];
        var itemBrandsForSearch = [];
        function triggerView(){
          document.getElementById('itemSearchInput').value = "";
          for (let x=0;x<document.getElementsByClassName('itemsBlocks').length;x++){
            document.getElementsByClassName('itemsBlocks')[x].style.display = "block";
          }
          document.getElementById("resultP").innerHTML = "Items ("+document.getElementsByClassName('itemsBlocks').length+")";
          if(document.getElementById("itemBlocksDiv").style.display != "none"){
            document.getElementById("itemBlocksDiv").style.display = "none";
            document.getElementById("itemReportDiv").style.display = "block";
          }else{
            document.getElementById("itemBlocksDiv").style.display = "block";
            document.getElementById("itemReportDiv").style.display = "none";
          }
        }
        function itemSearch(e){
          if ((document.getElementById('itemSearchInput').value.trim().length > 1)){
            for (let x=0;x<document.getElementsByClassName('itemsBlocks').length;x++){
              document.getElementsByClassName('itemsBlocks')[x].style.display = "none";
            }
            var counter = 0;
            for (var i=0;i<itemNamesForSearch.length;i++){
              if (itemNamesForSearch[i].toUpperCase().includes(document.getElementById("itemSearchInput").value.trim().toUpperCase()) || itemBrandsForSearch[i].toUpperCase().includes(document.getElementById("itemSearchInput").value.trim().toUpperCase())){
                for (let n=0;n<document.getElementsByClassName('itemsBlocks').length;n++){
                  if(n == i){
                    document.getElementsByClassName('itemsBlocks')[n].style.display = "block";
                    counter = counter + 1;
                  }
                }
              }
            }
            document.getElementById("resultP").innerHTML = "Items ("+counter+")";
            document.getElementById("itemBlocksDiv").style.display = "block";
            document.getElementById("itemReportDiv").style.display = "none";
          }else{
            for (let x=0;x<document.getElementsByClassName('itemsBlocks').length;x++){
              document.getElementsByClassName('itemsBlocks')[x].style.display = "block";
            }
            document.getElementById("resultP").innerHTML = "Items ("+document.getElementsByClassName('itemsBlocks').length+")";
            document.getElementById("itemBlocksDiv").style.display = "block";
            document.getElementById("itemReportDiv").style.display = "none";
          }
        }
        function tableViewTrigger(){
          if(document.getElementById("itemReportDiv").style.display == "block"){
            if(document.getElementById("reportTable").style.width == "100%"){
              document.getElementById("reportTable").style.width = "auto";
              document.getElementById("compactImg").src = "compact2.png";
            }else{
              document.getElementById("reportTable").style.width = "100%";
              document.getElementById("compactImg").src = "compact.png";
            }
          }
        }
        function changeRadio(x){
          if(x == "inStockType"){
            document.getElementById("radio1").checked = true;
          }else if(x == "outStockType"){
            document.getElementById("radio2").checked = true;
          }else{
            document.getElementById("radio3").checked = true;
          }
        }
      </script>
      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <label style="color:#0b5266;">Search</label>
          <input id="itemSearchInput" onkeyup="itemSearch(event)" type="text" class="w3-input w3-border">
          <a onclick="triggerView()" class="w3-right w3-text-grey" style="cursor:pointer;">List/Blocks</a>
          <p id="resultP" class="w3-text-grey" style="margin:0;">Items ()</p>
          <div style="background:url('compact2.png')"></div>
          <div class='w3-container w3-margin'>
            <a href='newItem.php' class='w3-btn w3-border w3-small w3-right'>Add new item</a>
            <form class="w3-margin-top" action="stock.php" method="post">
              <input class="w3-btn w3-white w3-border w3-small" type="submit" value="Filter">
              <input id="radio3" class="w3-radio" type="radio" name="searchType" value="all"> All
              <input id="radio1" class="w3-margin-left w3-radio" type="radio" name="searchType" value="In Stock"> In Stock
              <input id="radio2" class="w3-margin-left w3-radio" type="radio" name="searchType" value="Out of Stock"> Out of Stock
            </form>
          </div>
        </div>
      </div>
      <?php
      $sql2 = "SELECT * FROM `items` WHERE `inActive`=0";
      echo "<script>changeRadio('allType');</script>";
      if(isset($_POST["searchType"]) && $_POST["searchType"] == "In Stock"){
        $sql2 = "SELECT * FROM `items` WHERE `inActive`=0 AND `stock` > 0";
        echo "<script>changeRadio('inStockType');</script>";
      }elseif(isset($_POST["searchType"]) && $_POST["searchType"] == "Out of Stock"){
        $sql2 = "SELECT * FROM `items` WHERE `inActive`=0 AND `stock` = 0";
        echo "<script>changeRadio('outStockType');</script>";
      }
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        // echo "<div class='w3-container w3-margin'><a href='newItem.php' class='w3-btn w3-border w3-small'>Add new item</a></div>";
        $itemTable = "<div id='itemReportDiv' style='display:none;padding-bottom:40px;padding-left:32px;padding-right:32px;' class='w3-container w3-row'><a class='w3-text-grey' style='cursor:pointer;' onclick='tableViewTrigger()'><img style='width:24px;' id='compactImg' src='compact.png' /></a>";
        $itemTable = $itemTable ."<table id='reportTable' style='width:100%;margin:0 auto;' class='w3-table w3-table-all'><tr style='background:#128cae;color:#fff;'><th style='padding:16px;'>Image</th><th style='padding:16px;'>Brand</th><th style='padding:16px;'>Name</th><th style='padding:16px;'>Stock</th><th style='padding:16px;'>Purchased</th><th style='padding:16px;'>Provided</th><th style='padding:16px;'></th></tr>";
        echo "<div id='itemBlocksDiv' style='padding-bottom:40px;' class='w3-container w3-row'>";
        $itemNameJS = "";
        $itemBrandJS = "";
        while($row2 = $result2->fetch_assoc()){
          $itemPurchased = 0;
          $itemProvided = 0;
          $sql3 = "SELECT * FROM `purchaseItems` WHERE `itemID`=".$row2["id"];
          if(!$result3 = $mysqli->query($sql3)){
            $mysqli->close();
            die("queryFailed");
          }
          $itemPurchased = $result3->num_rows;
          $sql4 = "SELECT * FROM `provideItems` WHERE `itemID`=".$row2["id"];
          if(!$result4 = $mysqli->query($sql4)){
            $mysqli->close();
            die("queryFailed");
          }
          $itemProvided = $result4->num_rows;
          echo "<div class='w3-quarter w3-padding itemsBlocks'><div class='w3-light-grey w3-padding' style='height:165px;position:relative;'>";
          if(!empty($row2["img"])){
            echo "<img class='w3-right blockImages' style='width:30%;max-height:120px;' data-src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['img']."' />";
          }
          echo "<h4 style='text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["name"]."</h4>";
          echo "<p class='w3-text-grey' style='margin:0;'>".$row2["brand"]."</p>";
          echo "<p style='width:50px;background:#fff;' class='w3-tag w3-text-grey'>".$itemPurchased."</p>";
          if($row2["stock"]>0){
            echo "<p style='width:50px;' class='w3-tag w3-green'>".$row2["stock"]."</p>";
          }else{
            echo "<p style='width:50px;' class='w3-tag w3-red'>".$row2["stock"]."</p>";
          }
          echo "<p style='width:50px;background:#fff;' class='w3-tag w3-text-grey'>".$itemProvided."</p>";
          echo "<div style='text-align:right;'>
          <a href='itemDetails.php?id=".$row2["id"]."' class='w3-text-grey' style='text-decoration:underline;position:absolute;bottom:8px;right:16px;'>Details</a></div>";
          echo "</div></div>";
          $tagBackground = "w3-green";
          if($row2["stock"] < 1){
            $tagBackground = "w3-red";
          }
          $imageTable = "";
          if(!empty($row2["img"])){
            $imageTable = "<img class='w3-right tableImages' style='height:50px;' data-src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['img']."' />";
          }
          $itemTable = $itemTable."<tr><td style='width:80px;'>".$imageTable."</td><td style='padding:16px;'>".$row2["brand"]."</td><td style='padding:16px;'>".$row2["name"]."</td><td style='padding:16px;'><span style='width:50px;' class='w3-tag w3-round ".$tagBackground."'>".$row2["stock"]."</span></td><td style='padding:16px;'><span style='width:50px;' class='w3-tag w3-round w3-white'>".$itemPurchased."</span></td><td style='padding:16px;'><span style='width:50px;' class='w3-tag w3-round w3-white'>".$itemProvided."</span></td><td style='padding:16px;'><a href='itemDetails.php?id=".$row2["id"]."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></td></tr>";
          $itemNameJS = $itemNameJS . "'".$row2["name"]."',";
          $itemBrandJS = $itemBrandJS . "'".$row2["brand"]."',";
        }
        echo "</div>";
        $itemTable = $itemTable . "</table></div>";
        echo $itemTable;
        ?>
        <script>
          window.onload = function(){
            document.getElementById("resultP").innerHTML = "Items ("+document.getElementsByClassName('itemsBlocks').length+")";
            itemNamesForSearch = [<?php echo $itemNameJS; ?>];
            itemBrandsForSearch = [<?php echo $itemBrandJS; ?>];
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
        echo "no Items";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
