import FormattedText from './FormattedText';

const StructuredAnswer = ({ structuredAnswer, fallbackAnswer }) => {
    if (!structuredAnswer || structuredAnswer.length === 0) {
      return <FormattedText text={fallbackAnswer} />
    }
  
    return (
      <div className="space-y-4">
        {structuredAnswer.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold text-gray-800 mb-2 text-base">
              {section.subheading}
            </h4>
            <ul className="space-y-1 ml-4">
              {section.bulletPoints.map((point, pointIdx) => (
                <li key={pointIdx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-1.5 text-xs">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

export default StructuredAnswer;