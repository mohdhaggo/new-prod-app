<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Prod App - Doha Development</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
        }
        .time {
            font-size: 1.2rem;
            margin-top: 1rem;
            color: #ffd700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 New Production App</h1>
        <p>Your PHP development environment in Doha, Qatar</p>
        
        <div class="info">
            <p><strong>Project Path:</strong> C:\Users\M.Haggo\Desktop\new-prod-app</p>
            <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
            <p><strong>Server:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'PHP Built-in Server'; ?></p>
            <div class="time">
                <strong>Doha Time:</strong> <?php echo date('Y-m-d H:i:s'); ?>
            </div>
        </div>
        
        <div style="margin-top: 2rem;">
            <p>✅ PHP is working correctly!</p>
        </div>
    </div>
</body>
</html>