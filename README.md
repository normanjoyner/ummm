ummm
====================

## About

### Description
Universal Mesos Metric Mover sends Mesos resource metrics to a specified monitoring service

### Author
* Norman Joyner - norman.joyner@gmail.com

## Getting Started

### Installing
Run ```npm install -g ummm``` to install ummm, and put it in your PATH.

## Usage & Examples
```ummm --help``` can be used for a comprehensive list of available commands and options. Below is a simple cloudwatch example:

### Cloudwatch
```ummm cloudwatch --access-key-id AWS_ACCESS_KEY_ID --secret-access-key AWS_SECRET_ACCESS_KEY --prefix Mesos --dimension-name environment --dimension-value prod```

## Under the Hood

### Available Persistence Layers
* Cloudwatch

## Contributing
Please feel free to contribute by opening issues and creating pull requests!
