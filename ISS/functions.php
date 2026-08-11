<?php
  function showContents($r){
    echo "<script>document.getElementById('headerDiv').style.display='block';</script>";

    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $sql = "SELECT * FROM `purchase` ORDER BY `id` DESC";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql2 = "SELECT * FROM `provide` ORDER BY `id` DESC";
    if(!$result2 = $mysqli->query($sql2)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql3 = "SELECT * FROM `assets` WHERE `inActive` = 0 ORDER BY `id` DESC";
    if(!$result3 = $mysqli->query($sql3)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql4 = "SELECT SUM(stock) AS totalStock FROM `items` WHERE `inActive` = 0 AND `stock` > 0 ORDER BY `id` DESC";
    if(!$result4 = $mysqli->query($sql4)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql5 = "SELECT * FROM `items` WHERE `inActive` = 0 ORDER BY `id` DESC";
    if(!$result5 = $mysqli->query($sql5)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql6 = "SELECT Concat(changes_logs.date,' ',users.name,' ',changes_logs.action,' ',changes_logs.node,' (',changes_logs.nodeID,')') AS sentence FROM changes_logs
             LEFT JOIN users
             ON users.id = changes_logs.userID
             ORDER BY changes_logs.date DESC";
    if(!$result6 = $mysqli->query($sql6)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql7 = "SELECT type,COUNT(*) as total FROM `assets` WHERE `inActive` = 0 GROUP BY `type`";
    if(!$result7 = $mysqli->query($sql7)){
      $mysqli->close();
      die("queryFailed");
    }
    $sql8 = "SELECT category,COUNT(*) as total FROM `items` WHERE `inActive` = 0 AND `stock` > 0 GROUP BY `category`";
    if(!$result8 = $mysqli->query($sql8)){
      $mysqli->close();
      die("queryFailed");
    }
    $totalPurchase = $result->num_rows;
    $totalProvide = $result2->num_rows;
    $totalAssets = $result3->num_rows;
    $rowStock = $result4->fetch_array(MYSQLI_ASSOC);
    $totalStock = $rowStock["totalStock"];
    $allStocks = $result5->num_rows;
    while($row7 = $result7->fetch_assoc()){
      $rowAssets[$row7["type"]] = $row7["total"];
    }
    while($row8 = $result8->fetch_assoc()){
      $rowItems[$row8["category"]] = $row8["total"];
    }
    $totalDesktopAssets = round(($rowAssets['Desktop']/$totalAssets)*100);
    $totalMonitorAssets = round(($rowAssets['Monitor']/$totalAssets)*100);
    $totalLaptopAssets = round(($rowAssets['Laptop']/$totalAssets)*100);
    $totalWifiAccPointAssets = round(($rowAssets['Wifi Access Point']/$totalAssets)*100);
    $totalTabletAssets = round(($rowAssets['Tablet']/$totalAssets)*100);
    $totalCCTVAssets = round(($rowAssets['CCTV']/$totalAssets)*100);
    $totalHardwareItems = round(($rowItems['Hardware']/$allStocks)*100);
    $totalStationeryItems = round(($rowItems['IT Stationery and Accessories']/$allStocks)*100);
    $totalTonersItems = round(($rowItems['Toners/Rolls']/$allStocks)*100);


    ?>

    <style>
      h6{
        color:#d5deed;
      }
      .menuLink{
        cursor:pointer;
        transition:1s all;
      }
      hr{
        border-color:#043341;
      }
      a{
        text-decoration: none;
      }
    </style>

    <div class="w3-row">

      <div style="background:#0b5266;" class="w3-col m2 w3-animate-left" id="mainMenuDiv">
        <div style="padding-top:35px;" class="w3-container">
          <hr>
          <a href="assets.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Assets</h6></a>
          <a href="booking.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Booking</h6></a>
          <a href="newProvide.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Provide</h6></a>
          <hr>
          <a href="newPurchase.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Purchase / Service</h6></a>
          <hr>
          <a href="tapes.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Backup Tapes</h6></a>
          <a href="contracts.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Contracts</h6></a>
          <a href="employees.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Employees</h6></a>
          <a href="printers.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Printers</h6></a>
          <a href="serversList.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Servers</h6></a>
          <a href="stock.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Stock</h6></a>
          <a href="vendors.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Vendors</h6></a>
          <hr>
          <a href="report.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Report</h6></a>
          <a href="changeRequest.php"><h6 class="w3-hover-light-grey w3-padding w3-round menuLink">Requests</h6></a>
          <hr>
        </div>
      </div>

      <div id="mainContentDiv" class="w3-col m10 w3-container w3-margin-top w3-animate-bottom">
        <div class="w3-row">
          <div class="w3-quarter w3-padding">
            <a href="assets.php">
              <div class="w3-card-2 w3-padding w3-lime">
                <div class="w3-container">
                  <div class="w3-left"><img style="width:64px;" src="assets.png"></div>
                  <div class="w3-right">
                    <h3><?php echo $totalAssets; ?></h3>
                  </div>
                  <div class="w3-clear"></div>
                  <h4>Assets</h4>
                </div>
              </div>
            </a>
          </div>
          <div class="w3-quarter w3-padding">
            <a href="newProvide.php">
              <div class="w3-card-2 w3-padding w3-brown">
                <div class="w3-container">
                  <div class="w3-left"><img style="width:64px;" src="provide.png"></div>
                  <div class="w3-right">
                    <h3><?php echo $totalProvide; ?></h3>
                  </div>
                  <div class="w3-clear"></div>
                  <h4>Provide</h4>
                </div>
              </div>
            </a>
          </div>
          <div class="w3-quarter w3-padding">
            <a href="stock.php">
              <div class="w3-card-2 w3-padding w3-dark-grey">
                <div class="w3-container">
                  <div class="w3-left"><img style="width:64px;" src="stock.png"></div>
                  <div class="w3-right">
                    <h3><?php echo $totalStock; ?></h3>
                  </div>
                  <div class="w3-clear"></div>
                  <h4>Stock</h4>
                </div>
              </div>
            </a>
          </div>
        <div class="w3-quarter w3-padding">
          <a href="newPurchase.php">
            <div class="w3-card-2 w3-padding w3-teal">
              <div class="w3-container">
                <div class="w3-left"><img style="width:64px;" src="purchase.png"></div>
                <div class="w3-right">
                  <h3><?php echo $totalPurchase; ?></h3>
                </div>
                <div class="w3-clear"></div>
                <h4>Purchase</h4>
              </div>
            </div>
          </a>
        </div>
        <div class="w3-row">
          <div class="w3-padding w3-half">
            <div class="w3-card-2 w3-padding" id="myDiv" style="height:281px;overflow:hidden;">
              <h4 style="color:#303030;">Assets</h4>
              <button class="w3-button w3-small w3-round-xxlarge w3-right" onclick="myFunction()">Show More</button>
              <p class="w3-text-grey">Monitors</p>
              <div class="w3-light-grey w3-round-xlarge w3-small">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalMonitorAssets.'%'; ?>">
                  <?php echo $totalMonitorAssets."%"; ?>
                </div>
              </div>
              <p class="w3-text-grey">Desktops</p>
              <div class="w3-light-grey w3-round-xlarge w3-small">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalDesktopAssets.'%'; ?>">
                  <?php echo $totalDesktopAssets."%"; ?>
                </div>
              </div>
              <p class="w3-text-grey">Laptops</p>
              <div class="w3-light-grey w3-round-xlarge w3-small w3-margin-bottom">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalLaptopAssets.'%'; ?>">
                  <?php echo $totalLaptopAssets."%"; ?>
                </div>
              </div>
              <p class="w3-text-grey">Wifi Access Point</p>
              <div class="w3-light-grey w3-round-xlarge w3-small w3-margin-bottom">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalWifiAccPointAssets.'%'; ?>">
                  <?php echo $totalWifiAccPointAssets."%"; ?>
                </div>
              </div>
              <p class="w3-text-grey">Tablet</p>
              <div class="w3-light-grey w3-round-xlarge w3-small w3-margin-bottom">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalTabletAssets.'%'; ?>">
                  <?php echo $totalTabletAssets."%"; ?>
                </div>
              </div>
              <p class="w3-text-grey">CCTV</p>
              <div class="w3-light-grey w3-round-xlarge w3-small w3-margin-bottom">
                <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalCCTVAssets.'%'; ?>">
                  <?php echo $totalCCTVAssets."%"; ?>
                </div>
              </div>
          </div>
        </div>
        <div class="w3-half w3-padding">
          <div class="w3-card-2 w3-padding" style="height: 281px;">
            <h4 style="color:#303030;">Stock</h4>
            <p class="w3-text-grey">IT Stationery and Accessories</p>
            <div class="w3-light-grey w3-round-xlarge w3-small">
              <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalStationeryItems.'%'; ?>">
                <?php echo $totalStationeryItems."%"; ?>
              </div>
            </div>
            <p class="w3-text-grey">Toners/Rolls</p>
            <div class="w3-light-grey w3-round-xlarge w3-small">
              <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalTonersItems.'%'; ?>">
                <?php echo $totalTonersItems."%"; ?>
              </div>
            </div>
            <p class="w3-text-grey">Hardware</p>
            <div class="w3-light-grey w3-round-xlarge w3-small w3-margin-bottom">
              <div class="w3-container w3-center w3-round-xlarge" style="background:#0b5266;color:#fff;padding: 0px;width:<?php echo $totalHardwareItems.'%'; ?>">
                <?php echo $totalHardwareItems."%"; ?>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div class="w3-row" style="padding:16px 0px;">
          <div class="w3-third w3-padding">
            <a class="w3-btn w3-border" href="addNewPrinter.php" style="width:100%;background:#0b5266;color:#fff;">Add New Printer</a>
          </div>
          <div class="w3-third w3-padding">
            <a class="w3-btn w3-border" href="newAssets.php" style="width:100%;background:#0b5266;color:#fff;">Add New Asset</a>
          </div>
          <div class="w3-third w3-padding">
            <a class="w3-btn w3-border" href="newItem.php" style="width:100%;background:#0b5266;color:#fff;">Add New Item</a>
          </div>
        </div>
        <div class="w3-row">
          <div class="w3-padding w3-third w3-small" style="color:#303030;">
            <b>Latest Logs</b><br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>
              <?php
                $counter = 0;
                while($row6 = $result6->fetch_assoc() AND $counter < 10){
                  echo $row6['sentence']."<br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>";
                  $counter = $counter + 1;
                }
              ?>
          </div>
          <div class="w3-padding w3-third w3-small" style="color:#303030;">
            <b>Latest Assets</b><br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>
              <?php
                $counter = 0;
                while($row3 = $result3->fetch_assoc() AND $counter < 10){
                  echo $row3['deviceName']." (".$row3['type'].")<br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>";
                  $counter = $counter + 1;
                }
              ?>
          </div>
          <div class="w3-padding w3-third w3-small" style="color:#303030;">
            <b>Latest Items</b><br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>
              <?php
                $counter = 0;
                while($row5 = $result5->fetch_assoc() AND $counter < 10){
                  echo $row5['name']." (".$row5['category'].")<br><hr style='margin: 2px 0;border-top:1px solid #e3e3e3'>";
                  $counter = $counter + 1;
                }
              ?>
          </div>
        </div>
      </div>

    </div>

    <script>
      if(window.innerHeight > document.getElementById('mainContentDiv').clientHeight){
        document.getElementById("mainMenuDiv").style.height = (window.innerHeight - document.getElementById('headerDiv').clientHeight) + "px";
      }else{
        document.getElementById("mainMenuDiv").style.height = document.getElementById('mainContentDiv').clientHeight + 16 + "px";
      }
      function myFunction() {
        var x = document.getElementById("myDiv");
        if (x.style.overflow == "hidden") {
          x.style.overflow = "visible";
          x.style.height = "500px";
        } else {
          x.style.overflow = "hidden";
          x.style.height = "281px";
        }
      }
    </script>

    <?php
  }
?>
